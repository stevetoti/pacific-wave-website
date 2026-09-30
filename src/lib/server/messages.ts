import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./clients";
import { checked } from "./lms";
import { reportServerError } from "./report-error";
import { trainingTemplate } from "../email/training-template";
export type Person = {
  user_id: string;
  full_name: string;
  headline: string;
  city: string;
  avatar_url: string;
};
// Public-to-classmates person cards. Never includes email or phone.
export async function people(db: SupabaseClient, ids: string[]) {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (!unique.length) return new Map<string, Person>();
  const rows =
    checked(
      await db
        .from("pwd_lms_profiles")
        .select("user_id,full_name,occupation,organization,city,avatar_path")
        .in("user_id", unique),
    ) || [];
  const paths = rows.map((r) => r.avatar_path).filter(Boolean) as string[];
  const signed = paths.length
    ? checked(
        await db.storage
          .from("pwd-student-avatars")
          .createSignedUrls(paths, 3600),
      ) || []
    : [];
  const urls = new Map(signed.map((s) => [s.path, s.signedUrl]));
  // Students who never saved a profile fall back to the name on their enrolment.
  const missing = unique.filter((id) => !rows.find((x) => x.user_id === id)?.full_name);
  const orderNames = missing.length
    ? checked(
        await db
          .from("pwd_lms_orders")
          .select("user_id,name")
          .in("user_id", missing)
          .order("created_at", { ascending: false }),
      ) || []
    : [];
  const map = new Map<string, Person>();
  for (const id of unique) {
    const r = rows.find((x) => x.user_id === id);
    map.set(id, {
      user_id: id,
      full_name:
        r?.full_name ||
        orderNames.find((o) => o.user_id === id)?.name ||
        "Pacific Wave Digital",
      headline: [r?.occupation, r?.organization].filter(Boolean).join(" · "),
      city: r?.city || "",
      avatar_url: (r?.avatar_path && urls.get(r.avatar_path)) || "",
    });
  }
  return map;
}
function mailContext() {
  const live =
    process.env.TRAINING_EMAIL_MODE === "live" &&
    process.env.VERCEL_ENV === "production";
  return {
    live,
    origin: live
      ? "https://pacificwavedigital.com"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3100",
  };
}
// Emails a message notification if the person allows it. Best effort, logged in the admin email log.
export async function notifyByEmail(
  userId: string,
  kind: "connection_request" | "message_reminder",
  from: string[],
) {
  if (process.env.TRAINING_EMAIL_MODE === "disabled") return false;
  const db = getSupabaseAdmin();
  const { live, origin } = mailContext();
  try {
    const profile = checked(
      await db
        .from("pwd_lms_profiles")
        .select("message_emails,full_name")
        .eq("user_id", userId)
        .maybeSingle(),
    );
    if (profile && !profile.message_emails) return false;
    const { data } = await db.auth.admin.getUserById(userId);
    const email = data.user?.email;
    if (!email) return false;
    const who = from.length > 1 ? `${from.slice(0, -1).join(", ")} and ${from.at(-1)}` : from[0] || "Someone";
    const url = `${origin}/training-center/account?mode=signin&next=messages`;
    const content =
      kind === "connection_request"
        ? trainingTemplate({
            title: `${who} wants to connect`,
            intro: `${who} sent you a connection request on Pacific Wave Digital Training Centre. Once you accept, you can message each other directly.`,
            details: ["You can accept or ignore the request. Ignoring is private: they are not told."],
            action: "Review the request",
            url,
          })
        : trainingTemplate({
            title: `You have unread messages from ${who}`,
            intro: `${who} sent you ${from.length > 1 ? "messages" : "a message"} on Pacific Wave Digital Training Centre that you haven't read yet.`,
            action: "Read my messages",
            url,
          });
    const settings = `${origin}/training-center/account?mode=signin&next=messages`;
    const withOptOut = {
      html: content.html.replace(
        "</td></tr></table></td></tr></table></body>",
        `<p style="font-size:12px;color:#586980">Don't want these emails? Turn them off in <a href="${settings}">Messages → Settings</a>.</p></td></tr></table></td></tr></table></body>`,
      ),
      text: `${content.text}\n\nTurn these emails off in Messages → Settings: ${settings}`,
    };
    const { data: log } = await db
      .from("pwd_lms_account_emails")
      .insert({ email, purpose: kind, state: "pending" })
      .select("id")
      .single();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(12000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(log ? { "Idempotency-Key": `pwd-${kind}-${log.id}` } : {}),
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Pacific Wave Digital <noreply@pacificwavedigital.com>",
        to: live ? email : "delivered@resend.dev",
        subject:
          kind === "connection_request"
            ? `${who} wants to connect with you`
            : `Unread messages from ${who}`,
        ...withOptOut,
      }),
    });
    const result = response.ok ? await response.json() : null;
    if (log)
      await db
        .from("pwd_lms_account_emails")
        .update(
          result?.id
            ? { provider_id: result.id, state: live ? "accepted" : "test_accepted" }
            : { state: "failed" },
        )
        .eq("id", log.id);
    return Boolean(result?.id);
  } catch (error) {
    await reportServerError(`lms/${kind}-email`, error);
    return false;
  }
}
// Cron: one reminder email per person for messages unread for over an hour.
export async function processMessageReminders() {
  const db = getSupabaseAdmin();
  const due = (checked(await db.rpc("pwd_lms_due_message_reminders", { p_limit: 100 })) ||
    []) as { thread_id: string; user_id: string; last_id: number; sender: string }[];
  if (!due.length) return;
  const senders = await people(db, due.map((d) => d.sender));
  const byUser = new Map<string, typeof due>();
  for (const d of due) byUser.set(d.user_id, [...(byUser.get(d.user_id) || []), d]);
  for (const [userId, rows] of Array.from(byUser.entries())) {
    // Mark first so a slow provider never causes duplicate reminders.
    for (const r of rows)
      checked(
        await db.from("pwd_lms_dm_reads").upsert(
          { thread_id: r.thread_id, user_id: userId, reminded_id: r.last_id },
          { onConflict: "thread_id,user_id", ignoreDuplicates: false },
        ),
      );
    await notifyByEmail(
      userId,
      "message_reminder",
      Array.from(new Set(rows.map((r) => senders.get(r.sender)?.full_name || "a classmate"))),
    );
  }
}
