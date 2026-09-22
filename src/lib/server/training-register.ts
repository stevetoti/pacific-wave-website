import "server-only";
import { NextResponse } from "next/server";
import { registrationSchema, normalizePhone } from "../training/schema";
import { initialCohort } from "../training/config";
import { readJson, HttpError, apiError } from "./http";
import { rateLimit } from "./rate-limit";
import { getSupabaseAdmin } from "./clients";
import { notifyTraining } from "./training-email";
import { reportServerError } from "./report-error";
export async function registerTraining(
  request: Request,
  schedule: (callback: () => Promise<void>) => void,
) {
  try {
    const input = await readJson(request, registrationSchema);
    if (input.website)
      throw new HttpError(
        400,
        "Unable to accept this registration. Please contact the team.",
      );
    if (input.cohort_id !== initialCohort.id)
      throw new HttpError(400, "This cohort is not available.");
    await rateLimit(request, "vanuatu-training", 10);
    const { data, error } = await getSupabaseAdmin().rpc(
      "pwd_register_training",
      { input: { ...input, phone_normalized: normalizePhone(input.phone) } },
    );
    if (error || !data) throw error || new Error("Registration save failed");
    if (data.closed)
      throw new HttpError(
        409,
        "Registration for this class is closed. Please contact the team.",
      );
    if (data.created) {
      // A notification failure, including scheduling failure, must not undo a saved registration.
      try {
        schedule(async () => {
          try {
            await notifyTraining(data.id);
          } catch (e) {
            await reportServerError("/api/training/notification", e);
          }
        });
      } catch (e) {
        await reportServerError("/api/training/notification-schedule", e);
      }
    }
    return NextResponse.json(
      { success: true, reference: input.request_id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "/api/training/register");
  }
}
