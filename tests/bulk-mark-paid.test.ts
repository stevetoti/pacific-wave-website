import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

async function fixture() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key,email text);
    CREATE TABLE admin_users(email text,site_id text,is_active boolean,role text);
    CREATE TABLE pwd_lms_courses(id uuid primary key);
    CREATE TABLE pwd_lms_orders(id uuid primary key,course_id uuid,status text,amount int,method text,
      stripe_session text,checkout_lock_until timestamptz,reviewed_by uuid,review_note text,package_label text);
    CREATE TABLE pwd_lms_audit(id uuid default gen_random_uuid(),actor_id uuid,action text,target_id uuid);
    CREATE TABLE pwd_lms_emails(id uuid default gen_random_uuid(),order_id uuid,status text);
    CREATE FUNCTION pwd_lms_queue_email() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
    CREATE TRIGGER pwd_lms_order_email AFTER INSERT OR UPDATE OF status ON pwd_lms_orders FOR EACH ROW EXECUTE FUNCTION pwd_lms_queue_email();`);
  await db.exec(await readFile("supabase/migrations/20261020_bulk_mark_paid.sql", "utf8"));
  const actor = crypto.randomUUID(), course = crypto.randomUUID(), other = crypto.randomUUID();
  await db.query("INSERT INTO auth.users VALUES($1,'admin@example.test')", [actor]);
  await db.exec("INSERT INTO admin_users VALUES('admin@example.test','pacific-wave-digital',true,'admin')");
  await db.query("INSERT INTO pwd_lms_courses VALUES($1),($2)", [course, other]);
  const order = async (status = "pending", courseId = course, amount = 0, stripe: string | null = null) => {
    const id = crypto.randomUUID();
    await db.query("INSERT INTO pwd_lms_orders(id,course_id,status,amount,method,stripe_session) VALUES($1,$2,$3,$4,$5,$6)", [id, courseId, status, amount, amount === 0 ? "grant" : "bank", stripe]);
    return id;
  };
  const run = async (ids: string[], by = actor) => (await db.query<{ result: { updated_count: number; skipped_count: number; updated_ids: string[] } }>("SELECT pwd_lms_bulk_mark_paid($1,$2,$3,'Owner approved BLP participants') result", [course, ids, by])).rows[0].result;
  return { db, actor, course, other, order, run };
}

test("bulk marks only the confirmed course's pending snapshot, preserves amounts, audits, and sends no status emails", async () => {
  const f = await fixture();
  try {
    const a = await f.order(), b = await f.order("pending", f.course, 35000);
    const excluded = await Promise.all(["paid", "granted", "rejected", "refunded", "review", "revoked"].map(status => f.order(status)));
    const elsewhere = await f.order("pending", f.other), later = await f.order();
    const before = (await f.db.query("SELECT * FROM pwd_lms_emails")).rows.length;
    const result = await f.run([a, b, ...excluded]);
    assert.equal(result.updated_count, 2); assert.equal(result.skipped_count, 6);
    const rows = (await f.db.query<{ id: string; status: string; amount: number; method: string; reviewed_by: string }>("SELECT * FROM pwd_lms_orders")).rows;
    assert.equal(rows.find(r => r.id === a)?.amount, 0); assert.equal(rows.find(r => r.id === a)?.method, "grant");
    assert.equal(rows.find(r => r.id === b)?.amount, 35000); assert.equal(rows.find(r => r.id === b)?.method, "bank");
    assert.equal(rows.find(r => r.id === a)?.reviewed_by, f.actor);
    for (const id of [elsewhere, later]) assert.equal(rows.find(r => r.id === id)?.status, "pending");
    assert.equal((await f.db.query("SELECT * FROM pwd_lms_audit")).rows.length, 2);
    assert.equal((await f.db.query("SELECT * FROM pwd_lms_emails")).rows.length, before);
    assert.equal((await f.run([a, b])).updated_count, 0, "retry is idempotent");
    assert.equal((await f.db.query("SELECT * FROM pwd_lms_audit")).rows.length, 2);
    await f.order();
    assert.equal((await f.db.query("SELECT * FROM pwd_lms_emails")).rows.length, before + 1, "ordinary notifications still queue");
  } finally { await f.db.close(); }
});

test("cross-course or deleted IDs abort the whole batch, and unknown actors are refused", async () => {
  const f = await fixture();
  try {
    const a = await f.order(), b = await f.order("pending", f.other);
    await assert.rejects(f.run([a, b]), /do not belong/);
    await assert.rejects(f.run([a, crypto.randomUUID()]), /changed/);
    await assert.rejects(f.run([a], crypto.randomUUID()), /Admin access required/);
    assert.equal((await f.db.query("SELECT * FROM pwd_lms_orders WHERE status='paid'")).rows.length, 0);
    for (const role of ["anon", "authenticated"]) {
      await f.db.exec(`SET ROLE ${role}`);
      await assert.rejects(f.run([a]), /permission denied/);
      await f.db.exec("RESET ROLE");
    }
  } finally { await f.db.close(); }
});

test("a changed status or active card checkout is skipped while new pending registrations stay out of an old snapshot", async () => {
  const f = await fixture();
  try {
    const a = await f.order(), stripe = await f.order("pending", f.course, 35000, "cs_test_pending"), locked = await f.order();
    await f.db.query("UPDATE pwd_lms_orders SET checkout_lock_until=now()+interval '1 hour' WHERE id=$1", [locked]);
    await f.db.query("UPDATE pwd_lms_orders SET status='refunded' WHERE id=$1", [a]);
    const later = await f.order();
    assert.deepEqual(await f.run([a, stripe, locked]), { updated_count: 0, updated_ids: [], skipped_count: 3 });
    assert.equal((await f.db.query<{ status: string }>("SELECT status FROM pwd_lms_orders WHERE id=$1", [later])).rows[0].status, "pending");
  } finally { await f.db.close(); }
});

test("failed audit rolls back payment status, while duplicated IDs only change and audit once", async () => {
  const f = await fixture();
  try {
    const a = await f.order();
    await f.db.exec("ALTER TABLE pwd_lms_audit ADD CONSTRAINT reject_audit CHECK(false)");
    await assert.rejects(f.run([a]), /reject_audit/);
    assert.equal((await f.db.query<{ status: string }>("SELECT status FROM pwd_lms_orders WHERE id=$1", [a])).rows[0].status, "pending");
    await f.db.exec("ALTER TABLE pwd_lms_audit DROP CONSTRAINT reject_audit");
    assert.equal((await f.run([a, a])).updated_count, 1);
    assert.equal((await f.db.query("SELECT * FROM pwd_lms_audit")).rows.length, 1);
  } finally { await f.db.close(); }
});
