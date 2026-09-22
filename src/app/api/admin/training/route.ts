import { NextResponse } from "next/server";
import { authorize } from "@/lib/server/auth";
import { apiError, HttpError } from "@/lib/server/http";
import {
  initialCohort,
  locations,
  attendance,
  statuses,
} from "@/lib/training/config";
import { registrationCSV } from "@/lib/training/csv";
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  try {
    const p = new URL(request.url).searchParams;
    const cohort = p.get("cohort") || initialCohort.id;
    if (!/^[a-z0-9-]{1,60}$/.test(cohort))
      throw new HttpError(400, "Invalid cohort");
    const location = p.get("location"),
      attend = p.get("attendance"),
      status = p.get("status");
    if (
      (location && !(location in locations)) ||
      (attend && !(attend in attendance)) ||
      (status && !statuses.includes(status as (typeof statuses)[number]))
    )
      throw new HttpError(400, "Invalid filter");
    const page = Number(p.get("page") || 0);
    if (!Number.isInteger(page) || page < 0 || page > 10000)
      throw new HttpError(400, "Invalid page");
    const query = () => {
      let q = auth.db
        .from("pwd_training_registrations")
        .select("*,pwd_training_receipts(reference)", { count: "exact" })
        .eq("cohort_id", cohort)
        .order("created_at", { ascending: false })
        .order("id");
      if (location) q = q.eq("location_code", location);
      if (attend) q = q.eq("attendance_preference", attend);
      if (status) q = q.eq("status", status);
      return q;
    };
    if (p.get("format") === "csv") {
      const rows = [];
      for (let offset = 0; offset < 50000; offset += 500) {
        const { data, error, count } = await query().range(
          offset,
          offset + 499,
        );
        if (error) throw error;
        if ((count || 0) > 50000)
          throw new HttpError(413, "Narrow the export filters.");
        rows.push(...(data || []));
        if ((data?.length || 0) < 500) break;
      }
      return new Response(registrationCSV(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="vanuatu-training.csv"',
          "Cache-Control": "no-store",
        },
      });
    }
    const { data, error, count } = await query().range(
      page * 50,
      page * 50 + 49,
    );
    if (error) throw error;
    const { data: cohortRow, error: cohortError } = await auth.db
      .from("pwd_training_cohorts")
      .select("config")
      .eq("id", cohort)
      .single();
    if (cohortError) throw cohortError;
    return NextResponse.json(
      { registrations: data, count, cohort: cohortRow.config },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "/api/admin/training");
  }
}
