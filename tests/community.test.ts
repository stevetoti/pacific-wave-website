import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {trainingTemplate} from '../src/lib/email/training-template';
import type {Course} from '../src/lib/lms/types';
test('community migration protects chats and email logs, seeds group courses only and updates membership atomically',async()=>{
 const db=new PGlite();try{
 await db.exec("CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);CREATE TABLE pwd_training_cohorts(id text PRIMARY KEY);INSERT INTO pwd_training_cohorts VALUES('vanuatu-2026-10');");
 for(const file of ['20260915_training_center.sql','20260915_mentorship.sql','20260915_course_community.sql','20260915_course_community.sql'])await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
 assert.equal((await db.query("SELECT * FROM pwd_lms_channels c JOIN pwd_lms_courses p ON p.id=c.course_id WHERE p.private_sessions")).rows.length,0);
 assert.equal((await db.query("SELECT * FROM pwd_lms_channels")).rows.length,4);
 await db.exec('SET ROLE authenticated');for(const table of ['pwd_lms_messages','pwd_lms_channels','pwd_lms_channel_members','pwd_lms_account_emails'])await assert.rejects(()=>db.query('SELECT * FROM '+table));await db.exec('RESET ROLE');
 const user=crypto.randomUUID();await db.query('INSERT INTO auth.users VALUES($1)',[user]);
 const id=(await db.query<{id:string}>('SELECT id FROM pwd_lms_channels LIMIT 1')).rows[0].id;
 await db.query('SELECT pwd_lms_set_group_members($1,$2)',[id,[user]]);
 assert.equal((await db.query('SELECT * FROM pwd_lms_channel_members')).rows.length,1);
 await assert.rejects(()=>db.query('SELECT pwd_lms_set_group_members($1,$2)',[id,[crypto.randomUUID()]]));
 assert.equal((await db.query('SELECT * FROM pwd_lms_channel_members')).rows.length,1);
 }finally{await db.close();}
});
test('branded email escapes supplied content and recommends actual course prices',()=>{
 const template=trainingTemplate({title:'Welcome <script>',intro:'Hello & welcome',action:'Verify',url:'https://example.com/?a=1&b=2',courses:[{slug:'one-on-one-mentorship',title:'Mentorship',description:'Build software',cohort_id:null,amount:250000,currency:'VUV',enrollment_open:true} as Course]});
 assert.ok(!template.html.includes('<script>'));assert.ok(template.html.includes('&lt;script&gt;'));assert.ok(template.text.includes('250,000'));assert.ok(template.html.includes('training-center/programs/one-on-one-mentorship'));
});
