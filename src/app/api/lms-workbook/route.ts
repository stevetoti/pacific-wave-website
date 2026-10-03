import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { student,checked } from '@/lib/server/lms';
import { apiError,HttpError,readJson } from '@/lib/server/http';
import { workbook,workbookSaveSchema } from '@/lib/lms/workbook-schema';
import { workbookPdf } from '@/lib/server/workbook-pdf';
export const dynamic='force-dynamic';
export const maxDuration=60;
async function access(request:Request,courseId:string){
 if(!/^[0-9a-f-]{36}$/i.test(courseId))throw new HttpError(400,'Invalid course');
 const {db,user}=await student(request);
 const course=checked(await db.from('pwd_lms_courses').select('id,slug').eq('id',courseId).maybeSingle());
 if(course?.slug!==workbook.courseSlug)throw new HttpError(404,'Workbook not found');
 const orders=checked(await db.from('pwd_lms_orders').select('id').eq('course_id',courseId).eq('user_id',user.id).in('status',['paid','granted']).limit(1));
 if(!orders?.length)throw new HttpError(403,'Course access is required');
 return {db,user};
}
export async function GET(request:Request){try{
 const q=new URL(request.url).searchParams,courseId=q.get('course')||'';
 const {db,user}=await access(request,courseId);
 // user identity always comes from the verified token, never a query parameter.
 const pdf=q.get('pdf');
 if(pdf==='blank')return pdfResponse(await readFile(process.cwd()+'/resources/october-workbook.pdf'),'PWD-October-Workbook.pdf');
 const rows=checked(await db.from('pwd_lms_workbook_answers').select('lesson_key,answers,revision,updated_at').eq('user_id',user.id).eq('course_id',courseId));
 if(pdf==='completed')return pdfResponse(await workbookPdf(rows||[]),'PWD-Workbook-With-My-Answers.pdf');
 return NextResponse.json({rows},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return apiError(e,'lms/workbook/read');}}
export async function POST(request:Request){try{
 const body=await readJson(request,workbookSaveSchema);
 const {db,user}=await access(request,body.courseId);
 const result=checked(await db.rpc('pwd_save_workbook',{p_user:user.id,p_course:body.courseId,p_lesson:body.lessonKey,p_answers:body.answers,p_revision:body.revision}));
 if(!result?.length)throw new HttpError(409,'This lesson changed in another tab or device. Your unsaved text is still here. Copy it, then reload the saved version.');
 return NextResponse.json(result[0],{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return apiError(e,'lms/workbook/save');}}
function pdfResponse(bytes:Uint8Array,name:string){return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${name}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
