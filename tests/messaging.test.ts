import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("connection requests, messaging permissions, directory, counts and reminders", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,last_sign_in_at timestamptz);CREATE TABLE admin_users(email text,name text,role text,site_id text,is_active boolean);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY);INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');",
    );
    for (const file of [
      "20260915_training_center.sql",
      "20260915_mentorship.sql",
      "20260915_student_profiles.sql",
      "20260915_course_community.sql",
      "20260923_community_features.sql",
      "20260923_mentorship_communication.sql",
      "20260930_course_instructors.sql",
      "20260930_student_messaging.sql",
    ])
      await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
    const [ana, ben, cai, dee, tutor, outsider] = Array.from({ length: 6 }, () => crypto.randomUUID());
    const names: Record<string, string> = { [ana]: "Ana", [ben]: "Ben", [cai]: "Cai", [dee]: "Dee", [tutor]: "Tutor", [outsider]: "Outsider" };
    for (const [id, name] of Object.entries(names)) {
      await db.query("INSERT INTO auth.users(id,email) VALUES($1,$2)", [id, id + "@example.com"]);
      await db.query("INSERT INTO pwd_lms_profiles(user_id,full_name,city) VALUES($1,$2,'Port Vila')", [id, name]);
    }
    const course = (await db.query<{ id: string }>("SELECT id FROM pwd_lms_courses LIMIT 1")).rows[0].id;
    for (const id of [ana, ben, cai, dee])
      await db.query("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'x@x.test',$3,'12345',35000,'VUV','paid')", [id, course, names[id]]);
    await db.query("INSERT INTO pwd_lms_course_instructors(course_id,user_id) VALUES($1,$2)", [course, tutor]);
    const one = async <T>(sql: string, params: unknown[]) => (await db.query<T>(sql, params)).rows[0];
    const req = async (a: string, b: string) => (await one<{ s: string }>("SELECT pwd_lms_request_connection($1,$2,'hi') s", [a, b])).s;
    const can = async (a: string, b: string) => (await one<{ c: boolean }>("SELECT pwd_lms_can_message($1,$2) c", [a, b])).c;
    // Directory: students only, excluding me; instructors and non-students are not listed.
    const dir = (await db.query<{ full_name: string; connection: string; courses: string[] }>("SELECT * FROM pwd_lms_directory($1)", [ana])).rows;
    assert.deepEqual(dir.map((r) => r.full_name), ["Ben", "Cai", "Dee"]);
    assert.equal(dir[0].courses.length, 1);
    // Students without a saved profile still appear, using their enrolment name.
    await db.query("DELETE FROM pwd_lms_profiles WHERE user_id=$1", [dee]);
    assert.ok((await db.query("SELECT 1 FROM pwd_lms_directory($1) WHERE user_id=$2 AND full_name='Dee'", [ana, dee])).rows.length);
    await db.query("INSERT INTO pwd_lms_profiles(user_id,full_name,city,directory_visible) VALUES($1,'Dee','Port Vila',false)", [dee]);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_directory($1) WHERE user_id=$2", [ana, dee])).rows.length, 0, "hidden students are not listed");
    await db.query("UPDATE pwd_lms_profiles SET directory_visible=true WHERE user_id=$1", [dee]);
    // Requests
    assert.equal(await can(ana, ben), false, "no messaging before connecting");
    assert.equal(await req(ana, ben), "sent");
    assert.equal(await req(ana, ben), "sent", "duplicate request is harmless");
    assert.equal((await one<{ requests: number }>("SELECT * FROM pwd_lms_message_counts($1)", [ben])).requests, 1);
    assert.equal(await req(ben, ana), "connected", "a reply request accepts the pending one");
    assert.equal(await can(ana, ben), true);
    await assert.rejects(db.query("SELECT pwd_lms_request_connection($1,$2,'')", [ana, outsider]), /not available/);
    // Ignored requests stay "sent" for the requester and cannot be re-sent for 30 days.
    await req(cai, dee);
    await db.query("UPDATE pwd_lms_connections SET status='ignored',responded_at=now() WHERE requester=$1", [cai]);
    assert.equal(await req(cai, dee), "sent");
    assert.equal((await one<{ status: string }>("SELECT status FROM pwd_lms_connections WHERE requester=$1", [cai])).status, "ignored");
    assert.equal((await db.query<{ connection: string }>("SELECT connection FROM pwd_lms_directory($1) WHERE user_id=$2", [cai, dee])).rows[0].connection, "sent");
    await db.query("UPDATE pwd_lms_connections SET responded_at=now()-interval '31 days' WHERE requester=$1", [cai]);
    assert.equal(await req(cai, dee), "sent");
    assert.equal((await one<{ status: string }>("SELECT status FROM pwd_lms_connections WHERE requester=$1", [cai])).status, "pending", "re-sent after 30 days");
    // Instructors can message their students without a request, but not unrelated people.
    assert.equal(await can(tutor, cai), true);
    assert.equal(await can(cai, tutor), true);
    assert.equal(await can(tutor, outsider), false);
    // Blocking removes messaging and hides people from the directory both ways.
    await db.query("INSERT INTO pwd_lms_blocks(blocker,blocked) VALUES($1,$2)", [ben, ana]);
    assert.equal(await can(ana, ben), false);
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_directory($1) WHERE user_id=$2", [ana, ben])).rows.length, 0);
    await assert.rejects(db.query("SELECT pwd_lms_request_connection($1,$2,'')", [cai, cai]));
    // Unread counts and reminders
    const [a, b] = [tutor, cai].sort();
    const thread = (await one<{ id: string }>("INSERT INTO pwd_lms_dm_threads(user_a,user_b) VALUES($1,$2) RETURNING id", [a, b])).id;
    await db.query("INSERT INTO pwd_lms_dm_messages(thread_id,sender,body,created_at) VALUES($1,$2,'old',now()-interval '2 hours'),($1,$2,'new',now())", [thread, tutor]);
    assert.equal(Number((await one<{ unread: number }>("SELECT * FROM pwd_lms_message_counts($1)", [cai])).unread), 2);
    let due = (await db.query<{ user_id: string; last_id: number }>("SELECT * FROM pwd_lms_due_message_reminders()", [])).rows;
    assert.equal(due.length, 1);
    assert.equal(due[0].user_id, cai);
    await db.query("INSERT INTO pwd_lms_dm_reads(thread_id,user_id,reminded_id) VALUES($1,$2,$3)", [thread, cai, due[0].last_id]);
    due = (await db.query<{ user_id: string; last_id: number }>("SELECT * FROM pwd_lms_due_message_reminders()", [])).rows;
    assert.equal(due.length, 0, "one reminder per unread batch");
    await db.query("UPDATE pwd_lms_profiles SET message_emails=false WHERE user_id=$1", [cai]);
    await db.query("INSERT INTO pwd_lms_dm_messages(thread_id,sender,body,created_at) VALUES($1,$2,'later',now()-interval '90 minutes')", [thread, tutor]);
    assert.equal((await db.query("SELECT * FROM pwd_lms_due_message_reminders()", [])).rows.length, 0, "opted out");
  } finally {
    await db.close();
  }
});
