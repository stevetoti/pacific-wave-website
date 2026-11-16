import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCourseLanguage,translateCourseText} from '../src/lib/lms/course-language';
import {workbookSaveSchema} from '../src/lib/lms/workbook-schema';
import {coachInput} from '../src/lib/lms/coach/catalog';
test('English is default, unsupported locales fall back safely and source text remains unchanged',()=>{
 assert.equal(parseCourseLanguage(undefined),'en');assert.equal(parseCourseLanguage('xx'),'en');
 assert.equal(translateCourseText('Open workbook','fr',{fr:{'Open workbook':'Ouvrir le cahier'}}),'Ouvrir le cahier');
 assert.equal(translateCourseText('New lesson','fr',{}),'New lesson');
 assert.equal(translateCourseText(' Keep original spacing ','en',{}),' Keep original spacing ');
});
test('Bislama and French answers keep their original text and stable activity identifiers',()=>{
 const answer='Mi wantem statem wan bisnis. Je prépare mon activité à Port-Vila : café, coût, clientèle.';
 const result=workbookSaveSchema.parse({courseId:crypto.randomUUID(),lessonKey:'lesson-01',revision:0,answers:{'l01-f01':answer}});
 assert.equal(result.answers['l01-f01'],answer);
 for(const language of ['en','bi','fr'])assert.ok(coachInput.safeParse({action:'start',course_id:crypto.randomUUID(),role:'business',consent:true,language}).success);
 assert.equal(coachInput.safeParse({action:'start',course_id:crypto.randomUUID(),role:'business',consent:true,language:'xx'}).success,false);
});

import {readFileSync} from 'node:fs';
test('both course dictionaries cover every authored source string and preserve placeholders and links',()=>{
 const source=JSON.parse(readFileSync('scripts/localization/source.json','utf8')) as string[];
 for(const language of ['bi','fr']){
  const dict=JSON.parse(readFileSync(`src/lib/lms/locales/${language}.json`,'utf8')) as Record<string,string>;
  for(const text of source){assert.ok(dict[text]?.trim(),`${language}: missing ${text}`);
   for(const token of text.match(/\{[a-z_]+\}|https?:\/\/[^\s)]+/gi)||[])assert.ok(dict[text].includes(token),`${language}: lost ${token}`);
  }
 }
});

test('translated templates retain names and unknown user-authored text',()=>{
 const dictionaries={bi:{'Welcome back, {name}.':'Welkam bakegen, {name}.','This class has {count} parts. Select a video below to watch in order.':'Klas ia i gat {count} pat. Wajem long oda.'}};
 assert.equal(translateCourseText('Welcome back, Jean Claude.','bi',dictionaries),'Welkam bakegen, Jean Claude.');
 assert.equal(translateCourseText('This class has 3 parts. Select a video below to watch in order.','bi',dictionaries),'Klas ia i gat 3 pat. Wajem long oda.');
 assert.equal(translateCourseText('My original answer: I sell cakes.','bi',dictionaries),'My original answer: I sell cakes.');
 assert.equal(translateCourseText('Unknown private message','bi',dictionaries),'Unknown private message');
});

test('November headings and student classroom controls have Bislama translations',()=>{
 const bi=JSON.parse(readFileSync('src/lib/lms/locales/bi.json','utf8')) as Record<string,string>;
 for(const text of ['Build Your Business in 30 Days with AI — November–December 2026','Core lessons · Week 1','Join inside dashboard','My courses','My schedule']){
  assert.ok(bi[text]);assert.notEqual(translateCourseText(text,'bi',{bi}),text);
 }
});

import {formatCourseDate} from '../src/lib/lms/course-date';
test('Bislama dates keep Vanuatu scheduling while translating weekday and month names',()=>{
 const options={timeZone:'Pacific/Efate',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'} as const;
 const value='2026-11-16T04:00:00Z';
 assert.match(formatCourseDate(value,'bi',options),/Mande.*16.*Novemba.*15:00/);
 assert.match(formatCourseDate(value,'en',options),/Mon.*16.*Nov.*15:00/);
 assert.match(formatCourseDate(value,'fr',options),/16.*nov.*15:00/);
});

test('Bislama covers the current student interface and authored course copy without losing variables or URLs',()=>{
 const source=JSON.parse(readFileSync('scripts/localization/student-source.json','utf8')) as string[];
 const dictionary=JSON.parse(readFileSync('src/lib/lms/locales/bi.json','utf8')) as Record<string,string>;
 for(const text of source){
  assert.ok(dictionary[text]?.trim(),`Bislama translation missing: ${text}`);
  for(const number of text.match(/\d+(?:[,.]\d+)*/g)||[])assert.ok(dictionary[text].includes(number),`Translation changed numeric value ${number}`);
  for(const token of text.match(/\{[a-z_]+\}|https?:\/\/[^\s)]+/gi)||[])assert.ok(dictionary[text].includes(token),`Translation lost ${token}`);
 }
});
