import { NextResponse } from "next/server";
import { z } from "zod";
import { student, checked } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { zoomMeetingNumber } from "@/lib/lms/zoom";
import { zoomAttendeeSignature } from "@/lib/server/zoom";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const inputSchema = z.object({ lessonId: z.uuid() }).strict();
export async function POST(request: Request) {
  try {
    const { db, user } = await student(request);
    const { lessonId } = await readJson(request, inputSchema);
    const lesson = checked(await db.from("pwd_lms_lessons")
      .select("id,course_id,order_id,published,meeting_url,zoom_passcode")
      .eq("id", lessonId).maybeSingle());
    if (!lesson?.published) throw new HttpError(404, "Live class is not available.");
    const order = checked(await db.from("pwd_lms_orders").select("id,name")
      .eq("user_id", user.id).eq("course_id", lesson.course_id)
      .in("status", ["paid", "granted"]).maybeSingle());
    if (!order) throw new HttpError(403, "Approved course access is required.");
    const course = checked(await db.from("pwd_lms_courses").select("private_sessions").eq("id", lesson.course_id).single());
    if (!course) throw new HttpError(404, "Course not found.");
    if ((lesson.order_id && lesson.order_id !== order.id) || (course.private_sessions && lesson.order_id !== order.id))
      throw new HttpError(403, "This live class belongs to another enrolment.");
    const meetingNumber = zoomMeetingNumber(lesson.meeting_url);
    if (!meetingNumber) throw new HttpError(400, "Please use the instructor's external meeting link.");
    // pwd in invitation URLs is encrypted, not the plain passcode expected by the web SDK.
    if (new URL(lesson.meeting_url).searchParams.has("pwd") && !lesson.zoom_passcode)
      throw new HttpError(409, "Your instructor needs to add the Zoom passcode. You can still use Open in Zoom.");
    const credentials = zoomAttendeeSignature(meetingNumber);
    return NextResponse.json({
      ...credentials, meetingNumber, passWord: lesson.zoom_passcode || "",
      userName: (order.name || "Student").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 64),
    }, { headers: { "Cache-Control": "private, no-store", "Pragma": "no-cache" } });
  } catch (e) { return apiError(e, "lms/zoom/join"); }
}
