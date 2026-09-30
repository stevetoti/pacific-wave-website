import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("assigned instructors join course chat as staff and are listed with their courses", async () => {
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
    ])
      await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
    const [studentId, teacher, owner, other] = Array.from({ length: 4 }, () => crypto.randomUUID());
    for (const id of [studentId, teacher, owner, other])
      await db.query("INSERT INTO auth.users(id,email) VALUES($1,$2)", [id, id + "@example.com"]);
    await db.query("INSERT INTO admin_users VALUES($1,'Owner','super_admin','pacific-wave-digital',true)", [owner + "@example.com"]);
    const course = (await db.query<{ id: string }>("SELECT id FROM pwd_lms_courses WHERE NOT private_sessions LIMIT 1")).rows[0].id;
    const otherCourse = crypto.randomUUID();
    await db.query("INSERT INTO pwd_lms_courses(id,slug,title,kind,amount) VALUES($1,'other-course','Other','recorded',1000)", [otherCourse]);
    await db.query("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'s@x.test','Student One','12345',35000,'VUV','paid')", [studentId, course]);
    // The teacher is also enrolled as a student elsewhere-style: they must appear once, as staff.
    await db.query("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'t@x.test','Teacher As Student','12345',35000,'VUV','paid')", [teacher, course]);
    await db.query("INSERT INTO pwd_lms_profiles(user_id,full_name,instructor_title) VALUES($1,'Tina Teacher','Lead Instructor')", [teacher]);
    await db.query("INSERT INTO pwd_lms_course_instructors(course_id,user_id) VALUES($1,$2)", [course, teacher]);
    await db.query("INSERT INTO pwd_lms_course_instructors(course_id,user_id) VALUES($1,$2)", [otherCourse, other]);
    const people = (await db.query<{ user_id: string; name: string; instructor: boolean }>("SELECT * FROM pwd_lms_chat_people($1)", [course])).rows;
    const byId = (id: string) => people.filter((p) => p.user_id === id);
    assert.deepEqual(byId(studentId).map((p) => p.instructor), [false]);
    assert.equal(byId(teacher).length, 1, "instructor listed once");
    assert.equal(byId(teacher)[0].instructor, true);
    assert.equal(byId(teacher)[0].name, "Tina Teacher");
    assert.equal(byId(owner)[0]?.instructor, true, "admins keep staff powers");
    assert.equal(byId(other).length, 0, "instructors of other courses are not in this chat");
    const list = (await db.query<{ user_id: string; course_ids: string[]; instructor_title: string }>("SELECT * FROM pwd_lms_instructor_list()")).rows;
    assert.equal(list.length, 2);
    assert.deepEqual(list.find((r) => r.user_id === teacher)?.course_ids, [course]);
    assert.equal(list.find((r) => r.user_id === teacher)?.instructor_title, "Lead Instructor");
    const found = (await db.query<{ id: string }>("SELECT * FROM pwd_lms_user_by_email($1)", [teacher.toUpperCase() + "@EXAMPLE.COM"])).rows;
    assert.equal(found[0]?.id, teacher, "email lookup is case-insensitive");
  } finally {
    await db.close();
  }
});
