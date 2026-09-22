import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/server/auth";
import { readJson, apiError } from "@/lib/server/http";
import { initialCohort } from "@/lib/training/config";
export async function PATCH(request: Request) {
  const a = await authorize(request);
  if (a.response) return a.response;
  try {
    const input = await readJson(
      request,
      z.object({ registrationState: z.enum(["open", "closed"]) }),
    );
    const { data, error } = await a.db
      .from("pwd_training_cohorts")
      .select("config")
      .eq("id", initialCohort.id)
      .single();
    if (error) throw error;
    const { error: writeError } = await a.db
      .from("pwd_training_cohorts")
      .update({ config: { ...data.config, ...input } })
      .eq("id", initialCohort.id);
    if (writeError) throw writeError;
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e, "/api/admin/training/cohort");
  }
}
