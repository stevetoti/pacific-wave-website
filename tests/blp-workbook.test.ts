import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument} from 'pdf-lib';
import {blpWorkbook} from '../src/lib/lms/blp-workbook';
import {getWorkbook,workbookSaveSchema} from '../src/lib/lms/workbook-schema';
import {workbookContext} from '../src/lib/lms/workbook-context';
import {workbookPdf} from '../src/lib/server/workbook-pdf';
import {coachPrompt,coachRoles,coaches} from '../src/lib/lms/coach/catalog';
import {mintCoach} from '../src/lib/server/lms-coach';

test('BLP v5 includes six timed exercises and every digital worksheet with independent fields',()=>{
 assert.equal(getWorkbook(blpWorkbook.courseSlug),blpWorkbook);
 assert.equal(blpWorkbook.lessons.length,13);
 assert.deepEqual(blpWorkbook.lessons.slice(1,7).map(l=>l.time),['11:00–11:10','11:10–11:20','11:20–11:35','11:35–11:45','11:45–11:55','11:55–12:00']);
 const ids=blpWorkbook.lessons.flatMap(l=>l.fields.map(f=>f.id));assert.equal(new Set(ids).size,ids.length);
 for(const lesson of blpWorkbook.lessons){
  const body={courseId:crypto.randomUUID(),lessonKey:lesson.id,revision:0,answers:Object.fromEntries(lesson.fields.map(f=>[f.id,'Mi stap long Port Vila. Café — VT0']))};
  assert.ok(workbookSaveSchema.safeParse(body).success);
  assert.equal(workbookSaveSchema.safeParse({...body,answers:{'l01-f01':'other course'}}).success,false);
 }
 assert.equal(getWorkbook('unknown'),undefined);
});
test('BLP context includes labelled saved exercises and excludes unknown and other-course fields',()=>{
 const context=workbookContext([{lesson_key:'blp-e3',answers:{'blp-e3-f01':'Own draft','l01-f01':'Other course secret','injected':'not allowed'},updated_at:'2026-10-21T00:00:00Z'}],blpWorkbook);
 assert.match(JSON.stringify(context),/Own draft/);assert.doesNotMatch(JSON.stringify(context),/Other course secret|not allowed/);
 assert.match(context.source,/unverified drafts/);assert.equal(context.lessons[3].time,'11:20–11:35');
});
test('BLP completed PDF retains the v5 workbook and appends Unicode exercise answers',async()=>{
 const bytes=await workbookPdf([{lesson_key:'blp-e3',answers:{'blp-e3-f01':'Mi stap long Port Vila. Café — VT0'}}],blpWorkbook);
 assert.ok((await PDFDocument.load(bytes)).getPageCount()>24);
});
test('all seven tutor session payloads include saved BLP entries and Port Vila context',async()=>{
 const oldFetch=global.fetch,oldEnv={...process.env},payloads:Record<string,unknown>[]=[];
 const context={student:{name:'Workbook QA'},course:{slug:blpWorkbook.courseSlug},learning_location:{city:'Port Vila',country:'Vanuatu',timezone:'Pacific/Efate'},workbook:workbookContext([{lesson_key:'blp-e1',answers:{'blp-e1-f01':'Synthetic saved business'},updated_at:''}],blpWorkbook)};
 try{
 process.env.ANAM_API_KEY='test-key';
 for(const role of coachRoles)process.env[coaches[role].personaEnv]='test-persona';
 global.fetch=async(input,init)=>{
  if(String(input).includes('/personas/'))return Response.json({avatarId:'avatar',voiceId:'voice',llmId:'brain'});
  assert.equal(String(input),'https://api.anam.ai/v1/auth/session-token');payloads.push(JSON.parse(String(init?.body)));return Response.json({sessionToken:'synthetic-token'});
 };
 for(const role of coachRoles){
  assert.match(coachPrompt(role,context),/Synthetic saved business/);
  await mintCoach(role,context as Parameters<typeof mintCoach>[1]);
 }
 assert.equal(payloads.length,7);
 for(const payload of payloads){const text=JSON.stringify(payload);assert.match(text,/Synthetic saved business/);assert.match(text,/Port Vila/);assert.match(text,/Vanuatu/);assert.match(text,/snapshot/);assert.match(text,/Never include names, emails, workbook answers/);}
 }finally{global.fetch=oldFetch;for(const key of Object.keys(process.env))if(!(key in oldEnv))delete process.env[key];Object.assign(process.env,oldEnv);}
});
