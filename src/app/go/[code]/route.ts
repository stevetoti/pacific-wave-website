import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/clients";
import { reportServerError } from "@/lib/server/report-error";
import {
  affiliateCode,
  REFERRAL_COOKIE,
  REFERRAL_DAYS,
  safeDestination,
} from "@/lib/server/affiliates";
export const dynamic = "force-dynamic";
// Affiliate share link: /go/CODE?to=/training-center/programs/x
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const url = new URL(request.url);
  const to = safeDestination(url.searchParams.get("to"));
  const response = NextResponse.redirect(new URL(to, url.origin), 307);
  response.headers.set("Cache-Control", "no-store");
  const code = (await params).code.toUpperCase();
  if (!affiliateCode.test(code)) return response;
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("pwd_lms_affiliates")
      .select("id")
      .eq("code", code)
      .eq("status", "approved")
      .maybeSingle();
    if (!data) return response;
    await db
      .from("pwd_lms_affiliate_clicks")
      .insert({ affiliate_id: data.id, path: to });
    response.cookies.set(REFERRAL_COOKIE, code, {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: REFERRAL_DAYS * 86400,
    });
  } catch (error) {
    await reportServerError("go/affiliate", error);
  }
  return response;
}
