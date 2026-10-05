import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { parseYouTubeRecording, lessonYouTubeIds } from '../src/lib/lms/youtube-recordings';
import { liveRecordingPending } from '../src/lib/lms/lesson-recording';
import { workshopRecordingPending, blpSlug } from '../src/lib/lms/blp-workshop';

test('recording links normalize video URLs while rejecting fake domains and non-video input', () => {
  for (const link of ['dQw4w9WgXcQ',' https://youtu.be/dQw4w9WgXcQ?si=abc ', 'https://www.youtube.com/watch?si=abc&v=dQw4w9WgXcQ', 'https://m.youtube.com/shorts/dQw4w9WgXcQ','https://youtube.com/live/dQw4w9WgXcQ','https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ']) assert.equal(parseYouTubeRecording(link),'dQw4w9WgXcQ');
  for (const link of ['https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://evil.test/youtu.be/dQw4w9WgXcQ','javascript:alert(1)','https://youtube.com/playlist?list=abc','<iframe>','https://user@youtube.com/watch?v=dQw4w9WgXcQ']) assert.equal(parseYouTubeRecording(link),null);
  assert.deepEqual(lessonYouTubeIds({youtube_id:'dQw4w9WgXcQ'}),['dQw4w9WgXcQ']);
  assert.deepEqual(lessonYouTubeIds({youtube_id:'dQw4w9WgXcQ',youtube_ids:['abcdefghijk','abcdefghijk','12345678901']}),['abcdefghijk','12345678901']);
  assert.equal(liveRecordingPending({meeting_url:'https://zoom.us/j/123',youtube_ids:['abcdefghijk']}),false);
  assert.equal(workshopRecordingPending({slug:blpSlug},{youtube_ids:['abcdefghijk']}),false);
});

test('additive recording migration preserves old videos, supports removing all parts and blocks mentorship links', async () => {
 const db=new PGlite();
 try {
  await db.exec(`CREATE TABLE pwd_lms_courses(id int PRIMARY KEY, private_sessions boolean DEFAULT false); CREATE TABLE pwd_lms_lessons(id int PRIMARY KEY,course_id int,youtube_id text DEFAULT ''); INSERT INTO pwd_lms_courses VALUES(1,false),(2,true); INSERT INTO pwd_lms_lessons VALUES(1,1,'dQw4w9WgXcQ');`);
  const sql=await readFile('supabase/migrations/20261005_multiple_recordings.sql','utf8');await db.exec(sql);await db.exec(sql);
  const row=async()=> (await db.query<{youtube_id:string;youtube_ids:string[]}>('SELECT youtube_id,youtube_ids FROM pwd_lms_lessons WHERE id=1')).rows[0];
  assert.deepEqual((await row()).youtube_ids,['dQw4w9WgXcQ']);
  await db.exec("UPDATE pwd_lms_lessons SET youtube_ids=ARRAY['abcdefghijk','12345678901'] WHERE id=1");
  assert.equal((await row()).youtube_id,'abcdefghijk');
  await db.exec("UPDATE pwd_lms_lessons SET youtube_id='dQw4w9WgXcQ' WHERE id=1");
  assert.deepEqual((await row()).youtube_ids,['dQw4w9WgXcQ','12345678901']);
  await db.exec("UPDATE pwd_lms_lessons SET youtube_ids='{}',youtube_id='' WHERE id=1");
  assert.deepEqual(await row(),{youtube_id:'',youtube_ids:[]});
  await assert.rejects(db.exec("INSERT INTO pwd_lms_lessons(id,course_id,youtube_ids) VALUES(2,2,ARRAY['abcdefghijk'])"));
  await assert.rejects(db.exec("UPDATE pwd_lms_lessons SET youtube_ids=ARRAY['not a video'] WHERE id=1"));
  await assert.rejects(db.exec("UPDATE pwd_lms_lessons SET youtube_ids=ARRAY[NULL] WHERE id=1"));
 } finally {await db.close();}
});
