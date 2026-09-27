import { NextResponse } from "next/server";
import { z } from "zod";
import { student, checked } from "@/lib/server/lms";
import { apiError, readJson, HttpError } from "@/lib/server/http";
import { reportPdf } from "@/lib/server/coach-report-format";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { db, user } = await student(req);
    const q = new URL(req.url).searchParams,
      id = q.get("id");
    if (id) {
      z.uuid().parse(id);
      const session = checked(
        await db
          .from("pwd_lms_coach_sessions")
          .select(
            "id,title,role,course_id,created_at,ended_at,state,transcript,pwd_lms_courses(title)",
          )
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle(),
      );
      if (!session) throw new HttpError(404, "Session not found.");
      const report = checked(
        await db
          .from("pwd_lms_coach_reports")
          .select("state,report,email_state,error,updated_at")
          .eq("session_id", id)
          .maybeSingle(),
      );
      if (q.get("pdf") === "1") {
        if (!report?.report)
          throw new HttpError(
            409,
            "Your researched report is still being prepared.",
          );
        const bytes = await reportPdf({
          ...report.report,
          title: session.title || report.report.title,
        });
        return new Response(new Uint8Array(bytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition":
              'attachment; filename="PWD-Coaching-Session.pdf"',
            "Cache-Control": "private, no-store",
          },
        });
      }
      return NextResponse.json(
        { session, report },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const offset = z.coerce
      .number()
      .int()
      .min(0)
      .max(100000)
      .parse(q.get("offset") || 0);
    let query = db
      .from("pwd_lms_coach_sessions")
      .select(
        "id,title,role,course_id,created_at,state,pwd_lms_courses(title),pwd_lms_coach_reports(state,email_state)",
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + 19);
    if (q.get("course"))
      query = query.eq("course_id", z.uuid().parse(q.get("course")));
    const result = await query;
    return NextResponse.json(
      { sessions: checked(result), total: result.count },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e, "lms-coach/sessions");
  }
}
export async function PATCH(req: Request) {
  try {
    const { db, user } = await student(req);
    const input = await readJson(
      req,
      z.object({ id: z.uuid(), title: z.string().trim().min(1).max(160) }),
    );
    const rows = checked(
      await db
        .from("pwd_lms_coach_sessions")
        .update({ title: input.title })
        .eq("id", input.id)
        .eq("user_id", user.id)
        .select("id"),
    );
    if (!rows?.length) throw new HttpError(404, "Session not found.");
    return NextResponse.json({ saved: true });
  } catch (e) {
    return apiError(e, "lms-coach/rename");
  }
}
