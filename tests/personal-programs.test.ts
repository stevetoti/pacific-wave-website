import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {personalOffers,personalCheckoutNote} from '../src/lib/lms/personal-programs';
import {coachingWindow} from '../src/lib/lms/coach/schedule';

test('personal offers retain explicit lesson and mentorship periods and course-priced checkout',()=>{
 assert.deepEqual(personalOffers.map(p=>[p.amount,p.teachingWeeks,p.sessions.length,p.mentorshipMonths]),[[150000,6,18,1],[250000,6,18,3],[350000,12,36,3]]);
 for(const p of personalOffers){assert.match(personalCheckoutNote(p),/90 minutes/);assert.equal(new Set(p.sessions.map(s=>s.title)).size,p.sessions.length);}
 assert.match(personalCheckoutNote(personalOffers[2]),/after both phases/);
 // Teaching starts 16 Nov: six full teaching weeks, then the included calendar months.
 assert.equal(coachingWindow({slug:personalOffers[0].slug},null,['2026-11-16T04:00:00Z']).ends_on,'2027-01-28');
 assert.equal(coachingWindow({slug:personalOffers[1].slug},null,['2026-11-16T04:00:00Z']).ends_on,'2027-03-28');
 assert.equal(coachingWindow({slug:personalOffers[2].slug},null,['2026-11-16T04:00:00Z']).ends_on,'2027-05-08');
});

test('programme migration seeds 18/18/36 own-order lessons and preserves private session guards',async()=>{
 const db=new PGlite();try{
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY);INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');`);
 for(const file of ['20260915_training_center.sql','20260915_mentorship.sql'])await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
 await db.exec(`ALTER TABLE pwd_lms_courses ADD COLUMN is_private boolean DEFAULT false,ADD COLUMN requires_approval boolean DEFAULT false;ALTER TABLE pwd_lms_lessons ADD COLUMN section_title text DEFAULT '',ADD COLUMN recordings_published boolean DEFAULT true;`);
 const migration=await readFile('supabase/migrations/20261030_personal_training_options.sql','utf8');await db.exec(migration);await db.exec(migration);
 const user=crypto.randomUUID(),other=crypto.randomUUID();await db.query('INSERT INTO auth.users VALUES($1),($2)',[user,other]);
 for(const p of personalOffers){
  const c=(await db.query<{id:string;amount:number;private_sessions:boolean}>('SELECT * FROM pwd_lms_courses WHERE slug=$1',[p.slug])).rows[0];assert.equal(c.amount,p.amount);assert.equal(c.private_sessions,true);
  const order=(await db.query<{id:string}>(`INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency) VALUES($1,$2,'qa@example.invalid','QA','55555',$3,'VUV') RETURNING id`,[user,c.id,p.amount])).rows[0].id;
  const lessons=(await db.query<{order_id:string;recordings_published:boolean;content:string}>('SELECT * FROM pwd_lms_lessons WHERE course_id=$1',[c.id])).rows;assert.equal(lessons.length,p.sessions.length);assert.ok(lessons.every(l=>l.order_id===order&&!l.recordings_published));assert.match(lessons[0].content,/90 minutes/);
  await assert.rejects(()=>db.query(`INSERT INTO pwd_lms_lessons(course_id,title) VALUES($1,'Shared private lesson')`,[c.id]));
  const second=(await db.query<{id:string}>(`INSERT INTO pwd_lms_orders(user_id,course_id,email,name,phone,amount,currency) VALUES($1,$2,'qa2@example.invalid','QA2','55555',$3,'VUV') RETURNING id`,[other,c.id,p.amount])).rows[0].id;
  assert.notEqual(second,order);assert.equal((await db.query('SELECT id FROM pwd_lms_lessons WHERE order_id=$1',[second])).rows.length,p.sessions.length);
 }
 }finally{await db.close();}
});
