import {NextResponse} from "next/server";
import {z} from "zod";
import {teachingAccess} from "@/lib/server/teaching";
import {checked} from "@/lib/server/lms";
import {apiError,HttpError} from "@/lib/server/http";
export const dynamic="force-dynamic";
export async function GET(request:Request) {
 try {
  const access=await teachingAccess(request),q=new URL(request.url).searchParams;
  const input=z.object({course:z.uuid(),student:z.uuid()}).safeParse({course:q.get("course"),student:q.get("student")});
  if(!input.success)throw new HttpError(400,"Choose a course and student.");
  const {course,student:learner}=input.data;access.assertCourse(course);
  const {db}=access;
  const sessions=checked(await db.from("pwd_lms_coach_sessions").select("id,created_at,transcript").eq("course_id",course).eq("user_id",learner).eq("role","onboarding").eq("state","ended").not("onboarding_shared_at","is",null).order("created_at",{ascending:false}).limit(10))||[];
  const reports=sessions.length?checked(await db.from("pwd_lms_coach_reports").select("session_id,report").in("session_id",sessions.map(s=>s.id)).eq("state","ready"))||[]:[];
  return NextResponse.json({sessions:sessions.map(s=>({...s,summary:reports.find(r=>r.session_id===s.id)?.report?.summary||null}))},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return apiError(error,"lms/onboarding-review");}
}
