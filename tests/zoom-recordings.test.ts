import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { parseZoomRecording, studentZoomRecording, zoomRecordingUrlSchema } from '../src/lib/lms/zoom-recordings';
import { liveRecordingPending } from '../src/lib/lms/lesson-recording';
import { workshopRecordingPending, blpSlug } from '../src/lib/lms/blp-workshop';
const url = 'https://us02web.zoom.us/rec/share/example.AbC?startTime=1793421257000';
test('recording links allow only HTTPS Zoom share/player pages and preserve timestamps',()=>{
 assert.equal(parseZoomRecording(url),url);
 assert.equal(parseZoomRecording(' https://zoom.us/rec/play/example#fragment '),'https://zoom.us/rec/play/example');
 for(const value of ['http://zoom.us/rec/share/example','https://zoom.us.evil.test/rec/share/example','https://evil.test/?zoom.us/rec/share/a','https://zoom.us/j/123','https://zoom.us/rec/share/','https://user:secret@zoom.us/rec/share/a','https://zoom.us:444/rec/share/a','javascript:alert(1)']){
  assert.equal(parseZoomRecording(value),null,value);assert.equal(zoomRecordingUrlSchema.safeParse(value).success,false);
 }
});
test('only approved enrolments receive a published recording URL and passcode',()=>{
 const lesson={zoom_recording_url:url,zoom_recording_passcode:'Example#04',published:true,recordings_published:true};
 for(const status of ['paid','granted'])assert.deepEqual(studentZoomRecording(lesson,status),{zoom_recording_url:url,zoom_recording_passcode:'Example#04'});
 for(const status of ['pending','review','rejected','revoked',''])assert.deepEqual(studentZoomRecording(lesson,status),{zoom_recording_url:'',zoom_recording_passcode:''});
 for(const changes of [{published:false},{recordings_published:false},{zoom_recording_url:'https://evil.test'}])assert.deepEqual(studentZoomRecording({...lesson,...changes},'paid'),{zoom_recording_url:'',zoom_recording_passcode:''});
});
test('published Zoom replays unlock live/workshop completion while drafts remain blocked',()=>{
 const lesson={meeting_url:'https://zoom.us/j/123',zoom_recording_url:url,recordings_published:true};
 assert.equal(liveRecordingPending(lesson),false);assert.equal(workshopRecordingPending({slug:blpSlug},lesson),false);
 assert.equal(liveRecordingPending({...lesson,recordings_published:false}),true);assert.equal(workshopRecordingPending({slug:blpSlug},{...lesson,recordings_published:false}),true);
});
test('database migration keeps existing recordings and rejects unsafe/private cloud links',async()=>{
 const db=new PGlite();try{
  await db.exec("create table pwd_lms_courses(id text primary key,private_sessions boolean);create table pwd_lms_lessons(id text primary key,course_id text,youtube_id text default '',recordings_published boolean default false);insert into pwd_lms_courses values('group',false),('private',true);insert into pwd_lms_lessons(id,course_id,youtube_id) values('old','group','abcdefghijk');");
  await db.exec(readFileSync('supabase/migrations/20261117_zoom_recordings.sql','utf8'));
  const row=(await db.query<{youtube_id:string;zoom_recording_url:string}>("select youtube_id,zoom_recording_url from pwd_lms_lessons where id='old'")).rows[0];assert.deepEqual(row,{youtube_id:'abcdefghijk',zoom_recording_url:''});
  await db.query('update pwd_lms_lessons set zoom_recording_url=$1,zoom_recording_passcode=$2 where id=$3',[url,'Example#04','old']);
  for(const invalid of ['https://evil.test/rec/share/a','https://zoom.us/j/123'])await assert.rejects(db.query('update pwd_lms_lessons set zoom_recording_url=$1 where id=$2',[invalid,'old']));
  await assert.rejects(db.exec("insert into pwd_lms_lessons(id,course_id,zoom_recording_url) values('private-recording','private','https://zoom.us/rec/share/a')"));
  await assert.rejects(db.exec("insert into pwd_lms_lessons(id,course_id,zoom_recording_passcode) values('orphan','group','secret')"));
 }finally{await db.close();}
});
