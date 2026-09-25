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
      await db.query("select pwd_lms_coach_reserve($1,$2,null,'business')", [
        u,
        c,
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
