import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { encodeLessonThumbnail } from '../src/lib/server/lesson-thumbnails';
import { lessonSchema } from '../src/lib/lms/schema';
test('lesson thumbnails decode and produce lightweight 16:9 WebP; reject disguised or executable images',async()=>{
 const original=await sharp({create:{width:700,height:1000,channels:3,background:'#233c6f'}}).jpeg().toBuffer();
 const result=await encodeLessonThumbnail(original);const meta=await sharp(result).metadata();
 assert.equal(meta.width,960);assert.equal(meta.height,540);assert.equal(meta.format,'webp');assert.ok(result.length<100000);
 await assert.rejects(encodeLessonThumbnail(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><script>alert(1)</script></svg>')));
 await assert.rejects(encodeLessonThumbnail(Buffer.from('not an image')));
});
test('lesson save accepts only generated thumbnail storage paths',()=>{
 const lesson={course_id:crypto.randomUUID(),title:'Lesson',position:1,starts_at:null,content:'',youtube_id:'',meeting_url:'',published:false,quiz:[]};
 assert.ok(lessonSchema.safeParse({...lesson,thumbnail_path:`${lesson.course_id}/${crypto.randomUUID()}.webp`}).success);
 assert.equal(lessonSchema.safeParse({...lesson,thumbnail_path:'https://example.com/image.jpg'}).success,false);
 assert.equal(lessonSchema.safeParse({...lesson,thumbnail_path:'../../other/image.webp'}).success,false);
});
