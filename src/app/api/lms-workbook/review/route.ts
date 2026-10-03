import { NextResponse } from 'next/server';
import { z } from 'zod';
import { teachingAccess } from '@/lib/server/teaching';
import { checked } from '@/lib/server/lms';
import { apiError,HttpError } from '@/lib/server/http';
import { workbook } from '@/lib/lms/workbook-schema';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const q=new URL(request.url).searchParams,courseId=z.uuid().parse(q.get('course'));
 const {db,assertCourse}=await teachingAccess(request);assertCourse(courseId);
 const course=checked(await db.from('pwd_lms_courses').select('slug').eq('id',courseId).maybeSingle());
 if(course?.slug!==workbook.courseSlug)throw new HttpError(404,'No interactive workbook for this course');
 const target=q.get('student');
 if(target){
  const userId=z.uuid().parse(target);
  const enrolled=checked(await db.from('pwd_lms_orders').select('id').eq('course_id',courseId).eq('user_id',userId).in('status',['paid','granted']).limit(1));
  if(!enrolled?.length)throw new HttpError(403,'Student does not have active course access');
  const rows=checked(await db.from('pwd_lms_workbook_answers').select('lesson_key,answers,updated_at').eq('course_id',courseId).eq('user_id',userId));
  return NextResponse.json({rows},{headers:{'Cache-Control':'private, no-store'}});
 }
 // Paged roster: do not silently omit students at the database's default row limit.
 const students=new Map<string,{id:string;name:string}>();
 for(let offset=0;;offset+=500){
  const rows=checked(await db.from('pwd_lms_orders').select('id,user_id,name').eq('course_id',courseId).in('status',['paid','granted']).order('id').range(offset,offset+499))||[];
  for(const row of rows)if(row.user_id)students.set(row.user_id,{id:row.user_id,name:row.name||'Participant'});
  if(rows.length<500)break;
 }
 return NextResponse.json({students:Array.from(students.values()).sort((a,b)=>a.name.localeCompare(b.name))},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return apiError(e,'lms/workbook/review');}}
