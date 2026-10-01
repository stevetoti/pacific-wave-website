import { courseSchema } from "../src/lib/lms/schema";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("private workshops isolate directories, accepted connections, stale threads and mixed enrolments", async () => {
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
      "20261001_private_workshops.sql",
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
    // Public students can discover and connect across entirely different courses.
    const otherCourse = (await one<{ id: string }>("INSERT INTO pwd_lms_courses(slug,title,kind,amount) VALUES('other','Other public course','live',100) RETURNING id", [])).id;
    await db.query("UPDATE pwd_lms_orders SET course_id=$1 WHERE user_id=$2", [otherCourse, ben]);
    assert.equal(await req(ana,ben), 'sent');
    assert.equal(await req(ben,ana), 'connected');
    assert.equal(await can(ana,ben), true);
    const privateCourse = (await one<{ id: string }>("INSERT INTO pwd_lms_courses(slug,title,kind,amount,is_private) VALUES('private','Private workshop','live',0,true) RETURNING id", [])).id;
    const privateTwo = (await one<{ id: string }>("INSERT INTO pwd_lms_courses(slug,title,kind,amount,is_private) VALUES('private-two','Another workshop','live',0,true) RETURNING id", [])).id;
    await db.query("UPDATE pwd_lms_orders SET course_id=$1 WHERE user_id in ($2,$3)", [privateCourse,ben,cai]);
    await db.query("UPDATE pwd_lms_orders SET course_id=$1 WHERE user_id=$2", [privateTwo,dee]);
    const dir = async (u: string) => (await db.query<{ user_id:string; courses:string[] }>("SELECT * FROM pwd_lms_directory($1)",[u])).rows;
    assert.equal(await can(ana,ben),false,'existing accepted public connection cannot bridge privacy boundary');
    assert.deepEqual((await dir(ben)).map(x=>x.user_id),[cai]);
    assert.deepEqual(await dir(ana),[]);
    assert.deepEqual(await dir(dee),[]);
    await assert.rejects(db.query("SELECT pwd_lms_request_connection($1,$2,'')",[ana,ben]),/not available/);
    await assert.rejects(db.query("SELECT pwd_lms_request_connection($1,$2,'')",[ben,ana]),/not available/);
    await assert.rejects(db.query("SELECT pwd_lms_request_connection($1,$2,'')",[ben,dee]),/not available/);
    await assert.rejects(db.query("UPDATE pwd_lms_connections SET status='accepted' WHERE requester=$1",[ana]),/not available/);
    assert.equal(await req(ben,cai),'sent');
    assert.equal(await req(cai,ben),'connected');
    assert.equal(await can(ben,cai),true);
    assert.equal(await can(tutor,ben),false,'unrelated instructor excluded');
    await db.query("INSERT INTO pwd_lms_course_instructors(course_id,user_id) VALUES($1,$2)",[privateCourse,tutor]);
    assert.equal(await can(tutor,ben),true,'assigned instructor retained');
    // Dual public/private enrolments do not expose the private participant to public students.
    await db.query("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'x@x.test','Ben','12345',100,'VUV','paid')",[ben,course]);
    assert.equal(await can(ana,ben),false);
    assert.ok(!(await dir(ana)).some(x=>x.user_id===ben));
    // A different private membership/title must not leak to this participant's classmates.
    await db.query("INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency,status) VALUES($1,$2,'x@x.test','Cai','12345',100,'VUV','paid')",[cai,privateTwo]);
    assert.deepEqual((await dir(ben)).find(x=>x.user_id===cai)?.courses,['Private workshop']);
    // Existing history and unread badges become inaccessible when a participant changes audience.
    const [a,b]=[ana,ben].sort();
    const thread=(await one<{id:string}>("INSERT INTO pwd_lms_dm_threads(user_a,user_b) VALUES($1,$2) RETURNING id",[a,b])).id;
    await db.query("INSERT INTO pwd_lms_dm_messages(thread_id,sender,body,created_at) VALUES($1,$2,'old history',now()-interval '2 hours')",[thread,ana]);
    assert.equal(Number((await one<{unread:number}>("SELECT * FROM pwd_lms_message_counts($1)",[ben])).unread),0);
    assert.equal((await db.query("SELECT * FROM pwd_lms_due_message_reminders()")).rows.length,0);
    assert.deepEqual((await db.query("SELECT * FROM pwd_lms_allowed_peers($1,$2)",[ben,[ana,dee]])).rows,[]);
    await db.query("UPDATE pwd_lms_orders SET status='refunded' WHERE user_id=$1 AND course_id=$2",[ben,privateCourse]);
    assert.equal(await can(ben,cai),false,'refund revokes private peer access');
    assert.equal(await can(ana,ben),true,'public connection works again when private participation ends');
  } finally {
    await db.close();
  }
});

test('approval-based workshop schema accepts zero fee and rejects payable approval dead ends',()=>{
 const value={slug:'blp',title:'BLP workshop',description:'',introduction:'',kind:'live',amount:0,currency:'VUV',published:true,enrollment_open:true,is_private:true,requires_approval:true};
 assert.equal(courseSchema.safeParse(value).success,true);
 assert.equal(courseSchema.safeParse({...value,amount:100}).success,false);
 assert.equal(courseSchema.safeParse({...value,requires_approval:false}).success,false);
});
