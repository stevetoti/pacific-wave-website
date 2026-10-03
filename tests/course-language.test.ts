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
