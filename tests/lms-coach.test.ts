import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  visibleLesson,
  coachInput,
  coachPrompt,
  coachRoles,
} from "../src/lib/lms/coach/catalog";
test("coaches reject hidden and other-student lessons for every course type", () => {
  for (const privateCourse of [false, true]) {
    assert.equal(
      visibleLesson(
        { published: false, order_id: "mine" },
        "mine",
        privateCourse,
      ),
      false,
    );
    assert.equal(
      visibleLesson(
        { published: true, order_id: "other" },
        "mine",
        privateCourse,
      ),
      false,
    );
    assert.equal(
      visibleLesson(
        { published: true, order_id: "mine" },
        "mine",
        privateCourse,
      ),
      true,
    );
  }
  assert.equal(
    visibleLesson({ published: true, order_id: null }, "mine", true),
    false,
  );
  assert.equal(
    visibleLesson({ published: true, order_id: null }, "mine", false),
    true,
  );
});
test("coach start requires consent and known role; notes and transcripts are bounded", () => {
  const start = {
    action: "start",
    course_id: crypto.randomUUID(),
    role: "onboarding",
    consent: true,
  };
  assert.equal(coachInput.safeParse(start).success, true);
  assert.equal(
    coachInput.safeParse({ ...start, consent: false }).success,
    false,
  );
  assert.equal(
    coachInput.safeParse({ ...start, role: "administrator" }).success,
    false,
  );
  assert.equal(
    coachInput.safeParse({
      action: "notes",
      course_id: start.course_id,
      notes: "x".repeat(4001),
    }).success,
    false,
  );
  for (const role of coachRoles) {
    assert.equal(coachInput.safeParse({ ...start, role }).success, true);
    const p = coachPrompt(role, {
      student: { name: "Alex" },
      current_lesson: { title: "Positioning" },
    });
    assert.match(p, /Alex/);
    assert.match(p, /Positioning/);
    assert.match(p, /never instructions/);
    assert.match(p, /no such tools/);
  }
});
test("coach quota serializes reservations, separates students and keeps tables private", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table pwd_lms_courses(id uuid primary key);create table pwd_lms_lessons(id uuid primary key);",
    );
    await db.exec(
      await readFile(
        "supabase/migrations/20260925_student_video_coaches.sql",
        "utf8",
      ),
    );
    await db.exec(await readFile("supabase/migrations/20260925_add_specialist_coaches.sql", "utf8"));
    const u = crypto.randomUUID(),
      other = crypto.randomUUID(),
      c = crypto.randomUUID();
    await db.query("insert into auth.users values($1),($2)", [u, other]);
    await db.query("insert into pwd_lms_courses values($1)", [c]);
    await db.query("select pwd_lms_coach_reserve($1,$2,null,'onboarding')", [
      u,
      c,
    ]);
    await assert.rejects(
      db.query("select pwd_lms_coach_reserve($1,$2,null,'business')", [u, c]),
      /active_session/,
    );
    await db.query("select pwd_lms_coach_reserve($1,$2,null,'branding')", [
      other,
      c,
    ]);
    await db.query(
      "update pwd_lms_coach_sessions set state='ended' where user_id=$1",
      [u],
    );
    for (let i = 0; i < 7; i++) {
      await db.query("select pwd_lms_coach_reserve($1,$2,null,$3)", [
        u,
        c,
        coachRoles[i],
      ]);
      await db.query(
        "update pwd_lms_coach_sessions set state='ended' where user_id=$1",
        [u],
      );
    }
    await assert.rejects(
      db.query("select pwd_lms_coach_reserve($1,$2,null,'business')", [u, c]),
      /daily_limit/,
    );
    const p = await db.query<{ ok: boolean }>(
      "select not has_table_privilege('authenticated','pwd_lms_coach_notes','SELECT') and not has_table_privilege('anon','pwd_lms_coach_sessions','SELECT') and not has_function_privilege('anon','pwd_lms_coach_reserve(uuid,uuid,uuid,text)','EXECUTE') as ok",
    );
    assert.equal(p.rows[0].ok, true);
  } finally {
    await db.close();
  }
});

test("spoken timetable and coaching dates respect the published course window", async () => {
  const { spokenTime, coachingWindow } = await import("../src/lib/lms/coach/schedule");
  assert.equal(spokenTime("3–5 pm Vanuatu time (UTC+11)"), "from three p.m. to five p.m. Vanuatu time (UTC+11)");
  assert.equal(spokenTime("9:30 am–12 pm"), "from nine 30 a.m. to twelve p.m.");
  const cohort = { actionEnd: "2026-11-03", timezone: "Pacific/Efate" };
  assert.equal(coachingWindow({slug:"course"},cohort,[],new Date("2026-11-03T12:59:59Z")).active,true);
  assert.equal(coachingWindow({slug:"course"},cohort,[],new Date("2026-11-03T13:00:00Z")).active,false);
  assert.equal(coachingWindow({slug:"course",coaching_ends_on:"2026-10-30"},cohort,[],new Date("2026-11-01")).active,false);
});

test("onboarding completion is private, explicit, atomic and retains notes", async () => {
 const db = new PGlite();
 try {
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table pwd_lms_courses(id uuid primary key);create table pwd_lms_lessons(id uuid primary key);");
  for(const file of ["20260925_student_video_coaches.sql","20260925_add_specialist_coaches.sql","20260926_coach_orientation.sql"])await db.exec(await readFile("supabase/migrations/"+file,"utf8"));
  const u=crypto.randomUUID(),other=crypto.randomUUID(),c=crypto.randomUUID();
  await db.query("insert into auth.users values($1),($2)",[u,other]);await db.query("insert into pwd_lms_courses values($1)",[c]);
  await db.query("insert into pwd_lms_coach_notes(user_id,course_id,notes) values($1,$2,'Keep my goals')",[u,c]);
  const reserve=async()=> (await db.query<{id:string}>("select pwd_lms_coach_reserve($1,$2,null,'onboarding') id",[u,c])).rows[0].id;
  const end=async(id:string,who:string,done:boolean,t='[]')=>(await db.query<{ok:boolean}>("select pwd_lms_coach_finish($1,$2,$3,$4::jsonb,$5) ok",[who,c,id,t,done])).rows[0].ok;
  let sid=await reserve();assert.equal(await end(sid,other,false),false);
  await assert.rejects(end(sid,u,true),/onboarding_not_ready/);
  assert.equal(await end(sid,u,false),true); // interrupted session can retry
  sid=await reserve();assert.equal(await end(sid,u,true,JSON.stringify([{role:'user',content:'I understand the timetable'},{role:'persona',content:'You are ready for your course'}])),true);
  await assert.rejects(reserve(),/onboarding_completed/);
  const row=(await db.query<{notes:string;onboarding_completed_at:string}>("select * from pwd_lms_coach_notes where user_id=$1",[u])).rows[0];assert.equal(row.notes,'Keep my goals');assert.ok(row.onboarding_completed_at);
  await db.query("select pwd_lms_coach_reserve($1,$2,null,'business')",[u,c]);
  const perm=await db.query<{ok:boolean}>("select not has_function_privilege('authenticated','pwd_lms_coach_finish(uuid,uuid,uuid,jsonb,boolean)','EXECUTE') ok");assert.equal(perm.rows[0].ok,true);
 } finally { await db.close(); }
});
