import{sharedOnboardingContext,appendPrivateNotes}from"../src/lib/lms/coach/onboarding-context";
import test from "node:test";
import assert from "node:assert/strict";
import {readFile}from"node:fs/promises";
import{PGlite}from"@electric-sql/pglite";
import{onboardingCourse,onboardingPath,onboardingSignIn}from"../src/lib/lms/onboarding";
import{coachGreeting}from"../src/lib/lms/coach/greeting";
import{coachPrompt}from"../src/lib/lms/coach/catalog";
import{paidWelcomeEmail}from"../src/lib/email/paid-welcome";
test("email invitation uses an authenticated course destination and strict return IDs",()=>{
 const id=crypto.randomUUID();assert.equal(onboardingCourse(id),id);
 for(const bad of ["https://evil.example","//evil.example","/admin","anything?next=/admin",undefined])assert.equal(onboardingCourse(bad),null);
 assert.equal(onboardingPath(id),`/training-center/course/${id}?tutor=onboarding`);
 assert.equal(onboardingSignIn(id),`/training-center/account?mode=signin&onboarding=${id}`);
 const mail=paidWelcomeEmail("Student",{id,title:"Business training",slug:"vanuatu-november-2026"});
 assert.ok(mail.html.includes("introduction-v1.gif"));assert.ok(mail.html.includes("Speak with your Onboarding Tutor"));assert.ok(mail.text.includes(onboardingPath(id)));
});
test("tutor opens by name with one motivation question and respects the fixed timetable",()=>{
 const greeting=coachGreeting("onboarding","Amelia Student");assert.match(greeting,/Hello Amelia/);assert.match(greeting,/What motivated/);assert.equal((greeting.match(/\?/g)||[]).length,1);
 assert.match(coachGreeting("onboarding","Amelia Student","Bislama"),/Wanem/);
 assert.match(coachGreeting("onboarding","Amelia Student","French"),/motivé/);
 const prompt=coachPrompt("onboarding",{student:{name:"Amelia"},schedule:{days:"Monday, Thursday, Saturday"}});
 assert.match(prompt,/ONE AT A TIME/);assert.match(prompt,/motivat/);assert.match(prompt,/expect/);assert.match(prompt,/skip any question/);assert.match(prompt,/cannot be rearranged/);
});
test("sharing is explicit per onboarding session and never backfills older/private coaching",async()=>{
 const db=new PGlite();try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table pwd_lms_courses(id uuid primary key);create table pwd_lms_lessons(id uuid primary key);");
  await db.exec(await readFile("supabase/migrations/20260925_student_video_coaches.sql","utf8"));
  const u=crypto.randomUUID(),c=crypto.randomUUID();await db.query("insert into auth.users values($1)",[u]);await db.query("insert into pwd_lms_courses values($1)",[c]);
  const id=(await db.query<{id:string}>("select pwd_lms_coach_reserve($1,$2,null,'onboarding')id",[u,c])).rows[0].id;
  await db.exec(await readFile("supabase/migrations/20261104_onboarding_sharing.sql","utf8"));
  assert.equal((await db.query<{onboarding_shared_at:null}>("select onboarding_shared_at from pwd_lms_coach_sessions where id=$1",[id])).rows[0].onboarding_shared_at,null);
  await db.query("update pwd_lms_coach_sessions set onboarding_shared_at=now() where id=$1",[id]);
  await assert.rejects(db.query("update pwd_lms_coach_sessions set role='business' where id=$1",[id]),/pwd_onboarding_only_shared/);
  for(const role of ["anon","authenticated"]){await db.exec(`set role ${role}`);await assert.rejects(db.query("select * from pwd_lms_coach_sessions"),/permission denied/);await db.exec("reset role");}
 }finally{await db.close();}
});

test("shared onboarding cannot inherit private specialist conversations, notes or workbook content",()=>{
 const input={student:{name:"Amelia",city:"Port Vila",bio:"PRIVATE_BIO",learning_goals:"PRIVATE_OLD_GOAL"},workbook:{answers:"PRIVATE_WORKBOOK"},student_confirmed_notes:"PRIVATE_NOTES",previous_sessions:[{role:"business",recent_dialogue:"PRIVATE_SPECIALIST"}],course:{title:"Business course"},preferred_language:"English"};
 const safe=sharedOnboardingContext(input),json=JSON.stringify(safe);assert.ok(!json.includes("PRIVATE_"));assert.ok(json.includes("Amelia"));assert.ok(json.includes("Business course"));assert.equal(safe.preferred_language,"English");assert.ok(input.workbook.answers);
});

test("delayed private-notes saves cannot update a newly opened shared onboarding session",()=>{
 const calls:string[]=[],privateClient={addContext:(text:string)=>calls.push(text)},sharedClient={addContext:()=>{throw Error("Private notes leaked into onboarding");}};
 appendPrivateNotes({client:null,role:null,generation:1},{client:sharedClient,generation:2},"PRIVATE_IDLE_NOTES");
 appendPrivateNotes({client:privateClient,role:"business",generation:1},{client:sharedClient,generation:2},"PRIVATE_OLD_NOTES");
 appendPrivateNotes({client:sharedClient,role:"onboarding",generation:2},{client:sharedClient,generation:2},"PRIVATE_NOTES");assert.equal(calls.length,0);
 appendPrivateNotes({client:privateClient,role:"business",generation:3},{client:privateClient,generation:3},"My business notes");assert.equal(calls.length,1);
});
