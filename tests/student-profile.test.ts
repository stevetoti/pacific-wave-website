import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import {profileSchema,emptyProfile,profileCompletion} from '../src/lib/lms/profile';
test('student profile validates private details, secure website links and time zones',()=>{
 assert.equal(profileSchema.safeParse({...emptyProfile,full_name:'Test Student',website:'javascript:alert(1)'}).success,false);
 assert.equal(profileSchema.safeParse({...emptyProfile,full_name:'Test Student',timezone:'Not/AZone'}).success,false);
 assert.equal(profileSchema.safeParse({...emptyProfile,full_name:'Test Student',bio:'x'.repeat(1001)}).success,false);
 const valid=profileSchema.parse({...emptyProfile,full_name:'Test Student',website:'https://example.com',user_id:crypto.randomUUID()});assert.ok(!('user_id' in valid));
 assert.equal(profileCompletion(emptyProfile),0);assert.equal(profileCompletion({...emptyProfile,full_name:'Test',phone:'123',city:'Vila',country:'Vanuatu',occupation:'Founder',bio:'My bio',learning_goals:'Build',avatar_url:'photo'}),100);
});
test('student profile migration keeps personal data and avatar bucket private',async()=>{
 const db=new PGlite();try{await db.exec('CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE SCHEMA storage;CREATE TABLE storage.objects(id uuid,bucket_id text);CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');const sql=await readFile('supabase/migrations/20260915_student_profiles.sql','utf8');await db.exec(sql);await db.exec(sql);await db.exec('SET ROLE authenticated');await assert.rejects(()=>db.query('SELECT * FROM pwd_lms_profiles'));await db.exec('RESET ROLE');assert.equal((await db.query<{public:boolean}>("SELECT public FROM storage.buckets WHERE id='pwd-student-avatars'")).rows[0].public,false);}finally{await db.close();}
});
