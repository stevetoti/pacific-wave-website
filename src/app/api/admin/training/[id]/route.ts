import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/server/auth";
import { readJson, apiError, HttpError } from "@/lib/server/http";
import { statuses } from "@/lib/training/config";
import { notifyTraining } from "@/lib/server/training-email";
import { rateLimit } from "@/lib/server/rate-limit";
const updateSchema = z.object({
  status: z.enum(statuses),
  private_notes: z.string().trim().max(2000).optional(),
});
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      throw new HttpError(400, "Invalid reference");
    const input = await readJson(request, updateSchema);
    const { data, error } = await auth.db
      .from("pwd_training_registrations")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Registration not found");
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e, "/api/admin/training/update");
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      throw new HttpError(400, "Invalid reference");
    await rateLimit(request, "training-email-retry", 20);
    await notifyTraining(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e, "/api/admin/training/retry");
  }
}
