import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {workbookSaveSchema,workbook} from '../src/lib/lms/workbook-schema';
import {workbookPdf} from '../src/lib/server/workbook-pdf';
import {PDFDocument} from 'pdf-lib';
test('workbook accepts only the selected lesson fields and preserves empty, zero and unchecked values',()=>{
 const base={courseId:crypto.randomUUID(),lessonKey:'lesson-01',revision:0,answers:{'l01-f01':'0','l01-f02':'','lesson-01-check-0':false}};
 assert.ok(workbookSaveSchema.safeParse(base).success);
 for(const answers of [{'l02-f01':'wrong lesson'},{'l01-f01':true},{'l01-f01':'x'.repeat(6001)},{'user_id':'forged'}])assert.equal(workbookSaveSchema.safeParse({...base,answers}).success,false);
 assert.equal(new Set(workbook.lessons.flatMap(l=>l.fields.map(f=>f.id))).size,96);
 assert.deepEqual(workbook.lessons.map(l=>Number(l.date.slice(8))),[5,8,10,12,15,17,19,22,24,26,29,31]);
});
test('database rejects stale writes, isolates participants and stops revoked saves',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table pwd_lms_courses(id uuid primary key);create table pwd_lms_orders(user_id uuid,course_id uuid,status text);');
 await db.exec(await readFile('supabase/migrations/20261003_digital_workbook.sql','utf8'));
 const a=crypto.randomUUID(),b=crypto.randomUUID(),course=crypto.randomUUID();
 await db.query('insert into auth.users values($1),($2)',[a,b]);await db.query('insert into pwd_lms_courses values($1)',[course]);
 await db.query("insert into pwd_lms_orders values($1,$3,'paid'),($2,$3,'granted')",[a,b,course]);
 const save=(u:string,v:number,text:string)=>db.query<{revision:number}>('select * from pwd_save_workbook($1,$2,$3,$4,$5)',[u,course,'lesson-01',JSON.stringify({'l01-f01':text}),v]);
 assert.equal((await save(a,0,'A private')).rows[0].revision,1);
 assert.equal((await save(a,0,'duplicate')).rows.length,0);
 assert.equal((await save(a,1,'A newer')).rows[0].revision,2);
 assert.equal((await save(a,1,'stale')).rows.length,0);
 assert.equal((await save(b,0,'B private')).rows[0].revision,1);
 const result=await db.query<{answers:{'l01-f01':string}}>('select answers from pwd_lms_workbook_answers where user_id=$1',[a]);assert.equal(result.rows[0].answers['l01-f01'],'A newer');
 await db.query("update pwd_lms_orders set status='revoked' where user_id=$1",[a]);await assert.rejects(save(a,2,'revoked'),/Enrollment required/);
 await db.exec('set role authenticated');await assert.rejects(db.query('select * from pwd_lms_workbook_answers'),/permission denied/);await assert.rejects(save(b,1,'bypass'),/permission denied/);
 }finally{await db.close();}
});
test('completed export includes long Unicode responses without losing the original workbook',async()=>{
 const bytes=await workbookPdf([{lesson_key:'lesson-01',answers:{'l01-f01':('Bislama: Mi wantem statem bisnis. Café — 0\n').repeat(100),'lesson-01-check-0':true}}]);
 const pdf=await PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>82);await writeFile('/tmp/pwd-workbook-export-test.pdf',bytes);
});

import {workbookContext} from '../src/lib/lms/workbook-context';
test('AI workbook context is labelled, bounded and preserves zero without inventing missing work',()=>{
 const context=workbookContext([{lesson_key:'lesson-01',updated_at:'2026-10-03',answers:{'l01-f01':'0','l01-f02':'x'.repeat(6000),'foreign':'hidden'}}]);
 assert.equal(context.lessons[0].activities[0].answer,'0');
 assert.equal(context.lessons[0].activities[1].answer.length,400);
 assert.equal(context.lessons[0].activities[1].truncated,true);
 assert.equal(context.lessons[1].activities[0].answer,'');
 assert.ok(!JSON.stringify(context).includes('hidden'));
});
