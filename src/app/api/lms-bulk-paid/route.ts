import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/server/auth";
import { checked } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";

export const dynamic = "force-dynamic";
const json = (data: unknown) => NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
const inputSchema = z.object({
  course_id: z.uuid(),
  order_ids: z.array(z.uuid()).min(1).max(1000),
  note: z.string().trim().min(3).max(500),
});

// Never infer a course-wide batch: preview only explicit checked registration IDs.
export async function GET(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const query = new URL(request.url).searchParams;
    const selected = z.array(z.uuid()).min(1).max(1000).safeParse(query.getAll("order_id"));
    if (!selected.success) throw new HttpError(400, "Select at least one pending student.");
    const courseId = z.uuid().safeParse(query.get("course"));
    if (!courseId.success) throw new HttpError(400, "Choose a course.");
    const course = checked(await auth.db.from("pwd_lms_courses").select("id,title,currency,amount").eq("id", courseId.data).maybeSingle());
    if (!course) throw new HttpError(404, "Course not found.");
    const result = await auth.db.from("pwd_lms_orders").select("id,amount,name,email")
      .eq("course_id", course.id).in("id", Array.from(new Set(selected.data))).eq("status", "pending").order("created_at").order("id").limit(1000);
    const orders = checked(result) || [];
    return json({ course, order_ids: orders.map(o => o.id), total: orders.reduce((sum, o) => sum + o.amount, 0), registrations: orders.map(o => ({id: o.id, name: o.name, email: o.email})) });
  } catch (error) {
    return apiError(error, "lms-bulk-paid/preview");
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const input = await readJson(request, inputSchema);
    const { data, error } = await auth.db.rpc("pwd_lms_bulk_mark_paid", {
      p_course: input.course_id, p_orders: Array.from(new Set(input.order_ids)), p_actor: auth.user.id, p_note: input.note,
    });
    if (error) {
      if (error.code === "42501") throw new HttpError(403, "Admin access required.");
      if (error.code === "22023") throw new HttpError(409, error.message);
      throw error;
    }
    // The atomic database operation suppresses its status-email trigger. No sending here.
    return json(data);
  } catch (error) {
    return apiError(error, "lms-bulk-paid/update");
  }
}
