import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  advancedQuestionSchema as parse,
  assess,
  publicQuestions,
} from "../src/lib/lms/assessment";

test("eight quiz types grade with weights, normalized text and instructor review", () => {
  const qs = [
    { question: "Single?", options: ["a", "b"], answer: 1 },
    {
      type: "multiple",
      question: "Select both",
      options: ["a", "b", "c"],
      correct: [0, 2],
    },
    {
      type: "true_false",
      question: "True?",
      options: ["True", "False"],
      answer: 0,
    },
    {
      type: "short",
      question: "Name the tool",
      correct: ["AI", "Artificial intelligence"],
      points: 2,
    },
    {
      type: "blanks",
      question: "[[blank]] and [[blank]]",
      correct: ["one", "two"],
    },
    {
      type: "matching",
      question: "Match each",
      options: ["red", "blue"],
      prompts: ["Sky", "Rose"],
      correct: [1, 0],
    },
    {
      type: "ordering",
      question: "Put in order",
      options: ["third", "first", "second"],
      correct: [1, 2, 0],
    },
    {
      type: "essay",
      question: "Explain your business plan",
      points: 3,
      explanation: "Instructor only",
    },
  ].map((q) => parse.parse(q));
  const answers = [
    1,
    [0, 2],
    0,
    "  ai  ",
    ["ONE", "two"],
    [1, 0],
    [1, 2, 0],
    "My plan",
  ];
  const grade = assess(qs, answers);
  assert.equal(grade.earned, 8);
  assert.equal(grade.total, 11);
  assert.equal(grade.manual, 3);
  const publicData = JSON.stringify(publicQuestions(qs));
  assert.ok(!publicData.includes('"answer"'));
  assert.ok(!publicData.includes('"correct"'));
  assert.ok(!publicData.includes("Instructor only"));
  assert.throws(() =>
    assess(qs, [1, [0, 0], 0, "AI", ["one", "two"], [1, 0], [1, 2, 0], "plan"]),
  );
  assert.throws(() => assess(qs, []));
  assert.equal(
    assess(
      [
        parse.parse({
          type: "short",
          question: "Exact?",
          correct: ["AI"],
          case_sensitive: true,
        }),
      ],
      ["ai"],
    ).score,
    0,
  );
  assert.equal(
    parse.safeParse({
      type: "ordering",
      question: "Order",
      options: ["a", "b"],
      correct: [0, 0],
    }).success,
    false,
  );
  assert.equal(
    parse.safeParse({ type: "blanks", question: "No markers", correct: ["a"] })
      .success,
    false,
  );
});

test("private migration enforces grants, coupon limits and attempt snapshots", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table pwd_training_cohorts(id text primary key);insert into pwd_training_cohorts values('vanuatu-2026-10');`,
    );
    await db.exec(
      await readFile(
        "supabase/migrations/20260915_training_center.sql",
        "utf8",
      ),
    );
    await db.exec(
      `alter table pwd_lms_lessons add column order_id uuid;create table pwd_lms_account_emails(email text);create table pwd_lms_profiles(user_id uuid,full_name text,phone text);`,
    );
    await db.exec(
      await readFile("supabase/migrations/20260918_lms_advanced.sql", "utf8"),
    );
    const u = crypto.randomUUID(),
      u2 = crypto.randomUUID(),
      cid = crypto.randomUUID(),
      cid2 = crypto.randomUUID(),
      lid = crypto.randomUUID();
    await db.query(
      `insert into auth.users(id,email,email_confirmed_at) values($1,'qa@example.com',now()),($2,'other@example.com',now());`,
      [u, u2],
    );
    await db.exec(
      `insert into pwd_lms_account_emails values('qa@example.com'),('other@example.com');`,
    );
    await db.query(
      `insert into pwd_lms_courses(id,slug,title,kind,amount) values($1,'qa','QA','recorded',10000),($2,'qa2','QA2','recorded',20000)`,
      [cid, cid2],
    );
    await db.query(
      `select pwd_lms_grant('qa@example.com',$1::uuid[],'Purchased package',$2)`,
      [[cid], u],
    );
    let order = (
      await db.query<{
        id: string;
        status: string;
        amount: number;
        method: string;
      }>(`select * from pwd_lms_orders where user_id=$1`, [u])
    ).rows[0];
    assert.equal(order.status, "granted");
    assert.equal(order.amount, 0);
    assert.equal(order.method, "grant");
    await db.query(
      `select pwd_lms_grant('qa@example.com',$1::uuid[],'Duplicate',$2)`,
      [[cid], u],
    );
    assert.equal(
      (await db.query(`select * from pwd_lms_orders where user_id=$1`, [u]))
        .rows.length,
      1,
    );
    await assert.rejects(
      db.query(
        `select pwd_lms_grant('missing@example.com',$1::uuid[],'Package',$2)`,
        [[cid], u],
      ),
    );
    const oid = crypto.randomUUID(),
      oid2 = crypto.randomUUID();
    await db.query(
      `insert into pwd_lms_orders(id,user_id,course_id,email,name,phone,amount,currency) values($1,$2,$3,'qa@example.com','QA','12345',20000,'VUV'),($4,$5,$3,'other@example.com','Other','12345',20000,'VUV')`,
      [oid, u, cid2, oid2, u2],
    );
    await db.query(
      `insert into pwd_lms_coupons(code,course_id,kind,value,max_uses) values('HALF',$1,'percent',50,1),('FREE',$1,'free',100,10),('WRONG',$2,'fixed',1000,10)`,
      [cid2, cid],
    );
    await assert.rejects(
      db.query(`select pwd_lms_apply_coupon($1,$2,'WRONG')`, [oid, u]),
    );
    await db.query(`select pwd_lms_apply_coupon($1,$2,'HALF')`, [oid, u]);
    order = (
      await db.query<typeof order>(`select * from pwd_lms_orders where id=$1`, [
        oid,
      ])
    ).rows[0];
    assert.equal(order.amount, 10000);
    await db.query(`select pwd_lms_apply_coupon($1,$2,'HALF')`, [oid, u]);
    await assert.rejects(
      db.query(`select pwd_lms_apply_coupon($1,$2,'HALF')`, [oid2, u2]),
    );
    await assert.rejects(
      db.query(`select pwd_lms_apply_coupon($1,$2,'FREE')`, [oid, u]),
    );
    await db.query(`select pwd_lms_apply_coupon($1,$2,'FREE')`, [oid2, u2]);
    const free = (
      await db.query<{ amount: number; status: string; method: string }>(
        `select * from pwd_lms_orders where id=$1`,
        [oid2],
      )
    ).rows[0];
    assert.equal(free.amount, 0);
    assert.equal(free.status, "paid");
    assert.equal(free.method, "coupon");
    await db.query(
      `insert into pwd_lms_lessons(id,course_id,title,published,quiz,quiz_settings) values($1,$2,'Quiz',true,$3::jsonb,'{"pass_mark":80,"max_attempts":1,"time_limit_minutes":1}')`,
      [
        lid,
        cid,
        JSON.stringify([{ question: "Test?", options: ["a", "b"], answer: 1 }]),
      ],
    );
    const first = (
      await db.query<{ v: { id: string; questions: unknown[] } }>(
        `select pwd_lms_begin_quiz($1,$2) v`,
        [u, lid],
      )
    ).rows[0].v;
    const resume = (
      await db.query<{ v: { id: string } }>(
        `select pwd_lms_begin_quiz($1,$2) v`,
        [u, lid],
      )
    ).rows[0].v;
    assert.equal(first.id, resume.id);
    await assert.rejects(
      db.query(`select pwd_lms_begin_quiz($1,$2)`, [u2, lid]),
    );
    await db.query(
      `update pwd_lms_quiz_attempts set started_at=now()-interval '2 minutes' where id=$1`,
      [first.id],
    );
    await assert.rejects(
      db.query(`select pwd_lms_begin_quiz($1,$2)`, [u, lid]),
    );
    // Atomic exception rolls back the expiry update; the expired started attempt is still unusable by server time checks.
    const perms = await db.query<{ allowed: boolean }>(
      `select has_table_privilege('anon','pwd_lms_quiz_attempts','select') allowed`,
    );
    assert.equal(perms.rows[0].allowed, false);
  } finally {
    await db.close();
  }
});
