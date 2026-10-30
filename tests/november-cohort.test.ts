import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { initialCohort, novemberCohort, novemberCourseSlug, isOpen } from '../src/lib/training/config';
import { getWorkbook, workbook, workbookFile, workbookSaveSchema, workbooks } from '../src/lib/lms/workbook-schema';
import { workbookContext } from '../src/lib/lms/workbook-context';
import { coachingWindow, programOutline } from '../src/lib/lms/coach/schedule';
import { workbookPdf } from '../src/lib/server/workbook-pdf';

test('new cohort keeps the same days, time and fee with 12 core and 3 final revision dates', () => {
 assert.equal(initialCohort.start,'2026-10-05T15:00:00+11:00');
 assert.equal(novemberCohort.fee,initialCohort.fee);
 assert.equal(novemberCohort.timeLabel,initialCohort.timeLabel);
 assert.equal(novemberCohort.dates.length,15);
 assert.equal(novemberCohort.hours,30);
 assert.equal(novemberCohort.dates[0],'2026-11-16');
 assert.deepEqual(novemberCohort.dates.slice(-3),['2026-12-14','2026-12-17','2026-12-19']);
 for(const day of novemberCohort.dates) assert.ok([1,4,6].includes(new Date(day+'T00:00:00Z').getUTCDay()));
 assert.equal(isOpen(novemberCohort,new Date('2026-12-19T05:59:59Z')),true);
 assert.equal(isOpen(novemberCohort,new Date('2026-12-19T06:00:01Z')),false);
});

test('same core workbook content is re-dated, with separate field keys and revision activities', () => {
 const next=getWorkbook(novemberCourseSlug)!;
 assert.equal(next.lessons.length,15);
 workbook.lessons.forEach((old,i) => {
  const current=next.lessons[i];
  assert.equal(current.date,novemberCohort.dates[i]);
  assert.equal(current.title,old.title);
  assert.deepEqual(current.learn.slice(0,-1),old.learn.slice(0,-1));
  assert.notEqual(current.id,old.id);
 });
 assert.equal(new Set(workbooks.flatMap(w=>w.lessons.map(l=>l.id))).size,workbooks.reduce((n,w)=>n+w.lessons.length,0));
 const l=next.lessons[14], field=l.fields[0].id;
 const payload={courseId:crypto.randomUUID(),lessonKey:l.id,revision:0,answers:{[field]:'My next steps'}};
 assert.equal(workbookSaveSchema.safeParse(payload).success,true);
 assert.equal(workbookSaveSchema.safeParse({...payload,answers:{'l01-f01':'Wrong cohort fields'}}).success,false);
 assert.equal(JSON.stringify(next).includes('31 October'),false);
 for(const stale of ['1–3 November','1 November:','1, 2 and 3 November']) assert.equal(JSON.stringify(next).includes(stale),false);
 assert.equal(workbookFile(next),'november-workbook.pdf');
 assert.equal(workbookFile(workbook),'october-workbook.pdf');
});

test('tutor context and outline use the new timetable including revision', () => {
 const next=getWorkbook(novemberCourseSlug)!;
 const context=workbookContext([],next);
 assert.equal(context.lessons.at(-1)?.date,'2026-12-19');
 assert.equal(programOutline(novemberCourseSlug).length,5);
 assert.match(programOutline(novemberCourseSlug)[4].title,/Revise/);
 assert.equal(coachingWindow({slug:novemberCourseSlug},novemberCohort,[],new Date('2026-11-16')).ends_on,'2026-12-22');
});

test('November PDF exports use its own dated resource and include saved revision answers', async()=>{
 const next=getWorkbook(novemberCourseSlug)!;
 const blank=await PDFDocument.load(await readFile('resources/'+workbookFile(next)));
 const completed=await PDFDocument.load(await workbookPdf([{lesson_key:next.lessons[14].id,answers:{[next.lessons[14].fields[0].id]:'Final project review'}}],next));
 assert.ok(blank.getPageCount()>30);
 assert.ok(completed.getPageCount()>blank.getPageCount()+15);
});
