import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Loads every LMS migration (in dependency order) so deletes are checked against the real schema.
async function fullSchema() {
  const db = new PGlite();
  await db.exec(
    "CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,last_sign_in_at timestamptz,raw_user_meta_data jsonb default '{}');CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'select null::uuid';CREATE TABLE admin_users(email text,name text,role text,site_id text,is_active boolean);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text,name text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY, config jsonb default '{}');INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');",
  );
  const first = ["20260915_training_center.sql", "20260915_mentorship.sql", "20260915_student_profiles.sql", "20260915_course_community.sql"];
  // readiness_hardening needs Supabase's full auth schema and is unrelated to LMS records.
  const all = (await readdir("supabase/migrations")).filter((f) => f >= "20260915" && f !== "20260915_readiness_hardening.sql");
  const pending = [...first, ...all.filter((f) => !first.includes(f)).sort()];
  for (let pass = 0; pass < 4 && pending.length; pass++)
    for (const f of [...pending]) {
      try {
        await db.exec(await readFile("supabase/migrations/" + f, "utf8"));
        pending.splice(pending.indexOf(f), 1);
      } catch {
        await db.exec("ROLLBACK").catch(() => {});
      }
    }
  assert.deepEqual(pending, [], "all LMS migrations load");
  return db;
}

test("admin can delete a registration or a whole student without touching anyone else", async () => {
  const db = await fullSchema();
  try {
    const [stu, other, aff, adminU] = Array.from({ length: 4 }, () => crypto.randomUUID());
    for (const [id, email] of [[stu, "stu@x.test"], [other, "other@x.test"], [aff, "aff@x.test"], [adminU, "boss@x.test"]])
      await db.query("INSERT INTO auth.users(id,email) VALUES($1,$2)", [id, email]);
    await db.query("INSERT INTO admin_users VALUES('boss@x.test','Boss','admin','pacific-wave-digital',true)");
    const course = (await db.query<{ id: string }>("SELECT id FROM pwd_lms_courses WHERE slug='vanuatu-october-2026'")).rows[0].id;
    const lesson = (await db.query<{ id: string }>("SELECT id FROM pwd_lms_lessons WHERE course_id=$1 LIMIT 1", [course])).rows[0].id;
    const order = async (u: string) =>
      (await db.query<{ id: string }>("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status,method,proof_path) VALUES($1,$2,'x@x.test','N','12345',35000,'VUV','review','bank',$3) RETURNING id", [u, course, u + "/proof.png"])).rows[0].id;
    const o1 = await order(stu), o2 = await order(other);
    await db.query("INSERT INTO pwd_lms_progress(user_id,lesson_id) VALUES($1,$3),($2,$3)", [stu, other, lesson]);
    await db.query("INSERT INTO pwd_lms_profiles(user_id,full_name,avatar_path) VALUES($1,'Stu',$3),($2,'Other','')", [stu, other, stu + "/a.webp"]);
    // Referred by an affiliate with an unpaid commission.
    const affId = (await db.query<{ id: string }>("INSERT INTO pwd_lms_affiliates(user_id,code,status,full_name,email,payout_method) VALUES($1,'AFFX1234','approved','Aff','aff@x.test','bank') RETURNING id", [aff])).rows[0].id;
    await db.query("UPDATE pwd_lms_orders SET affiliate_id=$1 WHERE id=$2", [affId, o1]);
    await db.query("UPDATE pwd_lms_orders SET status='paid' WHERE id=$1", [o1]);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_affiliate_commissions WHERE order_id=$1", [o1])).rows.length, 1);
    // A direct-message thread with a file.
    const [a, b] = [stu, other].sort();
    const th = (await db.query<{ id: string }>("INSERT INTO pwd_lms_dm_threads(user_a,user_b) VALUES($1,$2) RETURNING id", [a, b])).rows[0].id;
    await db.query("INSERT INTO pwd_lms_dm_files(id,thread_id,user_id,path,name,mime,size) VALUES(gen_random_uuid(),$1,$2,'dm/x/y.webp','y.webp','image/webp',1)", [th, other]);
    await db.query("INSERT INTO pwd_lms_dm_messages(thread_id,sender,body) VALUES($1,$2,'hi')", [th, stu]);

    // 1. Delete just the registration.
    const reg = (await db.query<{ r: { proofs: string[] } }>("SELECT pwd_lms_delete_registration($1) r", [o1])).rows[0].r;
    assert.deepEqual(reg.proofs, [stu + "/proof.png"]);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_orders WHERE id=$1", [o1])).rows.length, 0);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_affiliate_commissions WHERE order_id=$1", [o1])).rows.length, 0);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_progress WHERE user_id=$1", [stu])).rows.length, 0);
    assert.equal((await db.query("SELECT 1 FROM auth.users WHERE id=$1", [stu])).rows.length, 1, "account kept");

    // 2. Delete the whole student.
    await order(stu);
    const all = (await db.query<{ r: { proofs: string[]; avatars: string[]; chat_files: string[] } }>("SELECT pwd_lms_delete_student($1) r", [stu])).rows[0].r;
    assert.equal(all.proofs.length, 1);
    assert.deepEqual(all.avatars, [stu + "/a.webp"]);
    assert.deepEqual(all.chat_files, ["dm/x/y.webp"]);
    for (const [sql, label] of [
      ["SELECT 1 FROM auth.users WHERE id=$1", "user"],
      ["SELECT 1 FROM pwd_lms_orders WHERE user_id=$1", "orders"],
      ["SELECT 1 FROM pwd_lms_profiles WHERE user_id=$1", "profile"],
      ["SELECT 1 FROM pwd_lms_dm_threads WHERE user_a=$1 OR user_b=$1", "threads"],
    ] as const)
      assert.equal((await db.query(sql, [stu])).rows.length, 0, label + " removed");
    // Everyone else is untouched.
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_orders WHERE id=$1", [o2])).rows.length, 1);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_progress WHERE user_id=$1", [other])).rows.length, 1);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_affiliates WHERE id=$1", [affId])).rows.length, 1);

    // 3. Safeguards.
    await assert.rejects(db.query("SELECT pwd_lms_delete_student($1)", [adminU]), /admin account/);
    await db.query("INSERT INTO pwd_lms_course_instructors(course_id,user_id) VALUES($1,$2)", [course, other]);
    await assert.rejects(db.query("SELECT pwd_lms_delete_student($1)", [other]), /instructor/);
    await db.query("DELETE FROM pwd_lms_course_instructors WHERE user_id=$1", [other]);
    await db.query("UPDATE pwd_lms_orders SET affiliate_id=$1 WHERE id=$2", [affId, o2]);
    await db.query("UPDATE pwd_lms_orders SET status='paid' WHERE id=$1", [o2]);
    await db.query("UPDATE pwd_lms_affiliate_commissions SET status='paid' WHERE order_id=$1", [o2]);
    await assert.rejects(db.query("SELECT pwd_lms_delete_registration($1)", [o2]), /already been paid/);
    await assert.rejects(db.query("SELECT pwd_lms_delete_student($1)", [aff]), /paid affiliate commission/);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_orders WHERE id=$1", [o2])).rows.length, 1, "refused delete changes nothing");
  } finally {
    await db.close();
  }
});
