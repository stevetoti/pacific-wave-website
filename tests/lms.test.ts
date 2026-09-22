import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  gradeQuiz,
  courseSchema,
  lessonSchema,
  orderSchema,
} from "../src/lib/lms/schema";
import { money } from "../src/lib/lms/types";
test("LMS validates prices, acknowledgement, video IDs and quiz answer ranges", () => {
  assert.equal(money(35000, "VUV").replace(/\s/g, ""), "VUV35,000");
  assert.equal(money(10000, "USD"), "$100.00");
  assert.equal(
    courseSchema.safeParse({
      slug: "x",
      title: "Test",
      description: "",
      introduction: "",
      kind: "recorded",
      amount: 0,
      currency: "VUV",
      published: false,
      enrollment_open: true,
    }).success,
    false,
  );
  assert.equal(
    orderSchema.safeParse({
      course_id: crypto.randomUUID(),
      name: "Test",
      phone: "+6785555555",
      attendance: "online",
      acknowledged: false,
    }).success,
    false,
  );
  assert.equal(
    lessonSchema.safeParse({
      course_id: crypto.randomUUID(),
      title: "Test",
      position: 1,
      starts_at: null,
      content: "",
      youtube_id: "<iframe>",
      meeting_url: "",
      published: true,
      quiz: [],
    }).success,
    false,
  );
  assert.equal(
    gradeQuiz([{ question: "Example?", options: ["a", "b"], answer: 1 }], [1]),
    100,
  );
  assert.equal(
    gradeQuiz([{ question: "Example?", options: ["a", "b"], answer: 1 }], [0]),
    0,
  );
  assert.throws(() =>
    gradeQuiz([{ question: "Example?", options: ["a", "b"], answer: 1 }], []),
  );
});
test("LMS migration isolates data, seeds 12 sessions, queues notifications and serializes payment actions", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY);INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');`,
    );
    const sql = await readFile(
      "supabase/migrations/20260915_training_center.sql",
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    assert.equal(
      (
        await db.query<{ count: number }>(
          "SELECT count(*)::int FROM pwd_lms_lessons",
        )
      ).rows[0].count,
      12,
    );
    const privateTables = await db.query<{
      relname: string;
      relrowsecurity: boolean;
    }>(
      "SELECT relname,relrowsecurity FROM pg_class WHERE relname LIKE 'pwd_lms_%' AND relkind='r'",
    );
    assert.equal(privateTables.rows.length, 7);
    assert.ok(privateTables.rows.every((t) => t.relrowsecurity));
    await db.exec("SET ROLE anon");
    await assert.rejects(() => db.query("SELECT * FROM pwd_lms_orders"));
    await db.exec("RESET ROLE");
    const user = crypto.randomUUID();
    await db.query("INSERT INTO auth.users VALUES($1)", [user]);
    const order = (
      await db.query<{ id: string }>(
        "INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency) SELECT $1,id,'test@example.com','Test','1234567',amount,currency FROM pwd_lms_courses RETURNING id",
        [user],
      )
    ).rows[0].id;
    assert.equal(
      (
        await db.query<{ count: number }>(
          "SELECT count(*)::int FROM pwd_lms_emails",
        )
      ).rows[0].count,
      1,
    );
    await assert.rejects(() =>
      db.query(
        "INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency) SELECT $1,id,'other@example.com','Other','1234567',amount,currency FROM pwd_lms_courses",
        [user],
      ),
    );
    assert.equal(
      (
        await db.query<{ locked: boolean }>(
          "SELECT pwd_lms_lock_order($1) AS locked",
          [order],
        )
      ).rows[0].locked,
      true,
    );
    assert.equal(
      (
        await db.query<{ locked: boolean }>(
          "SELECT pwd_lms_lock_order($1) AS locked",
          [order],
        )
      ).rows[0].locked,
      false,
    );
    await db.query("UPDATE pwd_lms_orders SET status='review' WHERE id=$1", [
      order,
    ]);
    assert.equal(
      (await db.query("SELECT * FROM pwd_lms_claim_emails()")).rows.length,
      2,
    );
    assert.equal(
      (await db.query("SELECT * FROM pwd_lms_claim_emails()")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});

test("shared Stripe account ignores other app orders and refunds before database/provider access", async () => {
  const { fulfill, refundAccess } = await import("../src/lib/server/lms");
  type Session = import("stripe").default.Checkout.Session;
  type Charge = import("stripe").default.Charge;
  await assert.doesNotReject(() =>
    fulfill({
      payment_status: "paid",
      metadata: { order_id: crypto.randomUUID() },
    } as unknown as Session),
  );
  await assert.doesNotReject(() =>
    refundAccess({
      refunded: true,
      amount: 100,
      amount_refunded: 100,
      payment_intent: "pi_other_app",
      metadata: { order_id: crypto.randomUUID() },
    } as unknown as Charge),
  );
});

test('mentorship migration restricts assignments and keeps coming-soon enrolment closed', async () => {
 const db=new PGlite();
 try {
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY);INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');`);
  await db.exec(await readFile('supabase/migrations/20260915_training_center.sql','utf8'));
  const sql=await readFile('supabase/migrations/20260915_mentorship.sql','utf8');await db.exec(sql);await db.exec(sql);
  const courses=(await db.query<{id:string;slug:string;amount:number;enrollment_open:boolean}>("SELECT * FROM pwd_lms_courses")).rows;
  assert.equal(courses.length,3);
  const mentor=courses.find(c=>c.slug==='one-on-one-mentorship')!;
  const soon=courses.find(c=>c.slug==='how-to-start-a-profitable-business')!;
  assert.equal(mentor.amount,25000);assert.equal(mentor.enrollment_open,true);assert.equal(soon.enrollment_open,false);
  const user=crypto.randomUUID();await db.query('INSERT INTO auth.users VALUES($1)',[user]);
  const order=(await db.query<{id:string}>("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency) VALUES($1,$2,'qa@example.com','QA','123456',25000,'VUV') RETURNING id",[user,mentor.id])).rows[0].id;
  await assert.rejects(()=>db.query("INSERT INTO pwd_lms_lessons(course_id,title) VALUES($1,'Shared private session')",[mentor.id]));
  await assert.rejects(()=>db.query("INSERT INTO pwd_lms_lessons(course_id,title,order_id) VALUES($1,'Wrong course',$2)",[soon.id,order]));
  await assert.rejects(()=>db.query("INSERT INTO pwd_lms_lessons(course_id,title,order_id,youtube_id) VALUES($1,'Public video',$2,'dQw4w9WgXcQ')",[mentor.id,order]));
  await assert.rejects(()=>db.query("INSERT INTO pwd_lms_lessons(course_id,title,order_id,recording_path) VALUES($1,'Wrong recording',$2,$3)",[mentor.id,order,crypto.randomUUID()+'/a.mp4']));
  await db.query("INSERT INTO pwd_lms_lessons(course_id,title,order_id,recording_path) VALUES($1,'Personal session',$2,$3)",[mentor.id,order,order+'/'+crypto.randomUUID()+'.mp4']);
  assert.equal((await db.query<{public:boolean}>("SELECT public FROM storage.buckets WHERE id='pwd-mentorship-recordings'")).rows[0].public,false);
 } finally {await db.close();}
});
