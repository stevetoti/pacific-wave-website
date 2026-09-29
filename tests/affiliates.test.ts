import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  referralCode,
  safeDestination,
} from "../src/lib/server/affiliates";

test("affiliate links only redirect to training pages and read a valid cookie", () => {
  assert.equal(safeDestination("/training-center/programs/one-on-one-mentorship"), "/training-center/programs/one-on-one-mentorship");
  assert.equal(safeDestination("/vanuatu-training"), "/vanuatu-training");
  for (const bad of ["https://evil.example", "//evil.example", "/admin", "/training-center?x=1", null])
    assert.equal(safeDestination(bad), "/training-center");
  const req = (cookie: string) => new Request("https://x.test", { headers: { cookie } });
  assert.equal(referralCode(req("a=1; pwd_aff=steve1234")), "STEVE1234");
  assert.equal(referralCode(req("pwd_aff=bad code")), null);
  assert.equal(referralCode(req("other=1")), null);
});

test("referrals attach once to unpaid orders and paid orders earn commission", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table pwd_training_cohorts(id text primary key);insert into pwd_training_cohorts values('vanuatu-2026-10');`,
    );
    await db.exec(await readFile("supabase/migrations/20260915_training_center.sql", "utf8"));
    await db.exec(`alter table pwd_lms_lessons add column order_id uuid;create table pwd_lms_account_emails(email text);create table pwd_lms_profiles(user_id uuid,full_name text,phone text);`);
    await db.exec(await readFile("supabase/migrations/20260918_lms_advanced.sql", "utf8"));
    await db.exec(await readFile("supabase/migrations/20260929_course_affiliates.sql", "utf8"));
    const [aff, buyer, buyer2, pendingAff, cid] = Array.from({ length: 5 }, () => crypto.randomUUID());
    await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,'a@x.test',now()),($2,'b@x.test',now()),($3,'c@x.test',now()),($4,'p@x.test',now())`, [aff, buyer, buyer2, pendingAff]);
    await db.query(`insert into pwd_lms_courses(id,slug,title,kind,amount) values($1,'qa','QA','recorded',35000)`, [cid]);
    await db.query(`insert into pwd_lms_affiliates(user_id,code,status,full_name,email,payout_method) values($1,'STEVE1234','approved','Steve','a@x.test','bank'),($2,'WAIT1234','pending','Pat','p@x.test','bank')`, [aff, pendingAff]);
    const order = async (user: string) => (await db.query<{ id: string }>(`insert into pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency) values($1,$2,'x@x.test','Buyer Person','12345',35000,'VUV') returning id`, [user, cid])).rows[0].id;
    const attach = async (o: string, code: string) => (await db.query<{ ok: boolean }>(`select pwd_lms_attach_affiliate($1,$2) as ok`, [o, code])).rows[0].ok;
    const selfOrder = await order(aff);
    assert.equal(await attach(selfOrder, "STEVE1234"), false, "self-referral blocked");
    const o1 = await order(buyer);
    assert.equal(await attach(o1, "WAIT1234"), false, "unapproved affiliate ignored");
    assert.equal(await attach(o1, "steve1234"), true);
    assert.equal(await attach(o1, "STEVE1234"), false, "attaches only once");
    await db.query(`update pwd_lms_orders set status='review' where id=$1`, [o1]);
    await db.query(`update pwd_lms_orders set status='paid' where id=$1`, [o1]);
    let c = (await db.query<{ amount: number; status: string; rate: string }>(`select * from pwd_lms_affiliate_commissions where order_id=$1`, [o1])).rows;
    assert.equal(c.length, 1);
    assert.equal(c[0].amount, 5250, "15% of VUV 35,000");
    assert.equal(c[0].status, "pending");
    await db.query(`update pwd_lms_orders set status='refunded' where id=$1`, [o1]);
    c = (await db.query<typeof c[0]>(`select * from pwd_lms_affiliate_commissions where order_id=$1`, [o1])).rows;
    assert.equal(c[0].status, "void", "refund cancels an unpaid commission");
    // Paid commission survives a later refund but is flagged for manual recovery.
    const o2 = await order(buyer2);
    await attach(o2, "STEVE1234");
    await db.query(`update pwd_lms_orders set status='paid' where id=$1`, [o2]);
    await db.query(`update pwd_lms_affiliate_commissions set status='paid' where order_id=$1`, [o2]);
    await db.query(`update pwd_lms_orders set status='refunded' where id=$1`, [o2]);
    const paid = (await db.query<{ status: string; note: string; order_refunded_at: string | null }>(`select * from pwd_lms_affiliate_commissions where order_id=$1`, [o2])).rows[0];
    assert.equal(paid.status, "paid");
    assert.ok(paid.order_refunded_at);
    assert.match(paid.note, /recover manually/);
    // Once paid, a referral can no longer be attached; unattributed orders earn nothing.
    assert.equal(await attach(o2, "STEVE1234"), false);
    await db.query(`update pwd_lms_orders set status='paid' where id=$1`, [selfOrder]);
    assert.equal((await db.query(`select 1 from pwd_lms_affiliate_commissions where order_id=$1`, [selfOrder])).rows.length, 0);
  } finally {
    await db.close();
  }
});
