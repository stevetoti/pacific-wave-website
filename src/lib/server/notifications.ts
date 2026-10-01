import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./clients";
import { checked } from "./lms";
import { reportServerError } from "./report-error";
import { allowedPeers, isPeerNotification } from "./messaging-scope";
import { people } from "./messages";
import { notificationTemplate } from "../email/notification-template";
export type NotificationKind =
  | "message"
  | "connection_request"
  | "connection_accepted"
  | "mention"
  | "announcement";
// Messages wait briefly so a burst becomes one email and people reading the chat aren't emailed at all.
const EMAIL_DELAY: Record<NotificationKind, number> = {
  message: 120,
  mention: 120,
  announcement: 60,
  connection_request: 0,
  connection_accepted: 0,
};
// Best effort: a notification failure must never block sending a message.
export async function notify(
  db: SupabaseClient,
  users: string[],
  n: { kind: NotificationKind; actor: string; group: string; title: string; body: string; link: string },
) {
  if (isPeerNotification(n.kind)) {
    const allowed = await allowedPeers(db, n.actor, users);
    users = users.filter(id => allowed.has(id));
  }
  if (!users.length) return;
  const { error } = await db.rpc("pwd_lms_notify", {
    p_users: Array.from(new Set(users)),
    p_kind: n.kind,
    p_actor: n.actor,
    p_group: n.group,
    p_title: n.title,
    p_body: n.body,
    p_link: n.link,
    p_delay_seconds: EMAIL_DELAY[n.kind],
  });
  if (error) await reportServerError("lms/notify", error);
}
export async function markNotificationsRead(db: SupabaseClient, userId: string, groups: string[]) {
  if (!groups.length) return;
  await db
    .from("pwd_lms_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("group_key", groups)
    .is("read_at", null);
}
type Row = {
  id: string;
  user_id: string;
  kind: NotificationKind;
  actor: string | null;
  title: string;
  body: string;
  link: string;
  count: number;
  read_at: string | null;
  email_attempts: number;
};
function copy(n: Row, actor: string) {
  const first = actor.split(" ")[0] || actor;
  switch (n.kind) {
    case "message":
      return {
        subject: n.count > 1 ? `${n.count} new messages from ${actor}` : `New message from ${actor}`,
        heading: n.count > 1 ? `${first} sent you ${n.count} messages` : `${first} sent you a message`,
        intro: "Reply on the Training Centre to keep the conversation going.",
        action: "Reply",
      };
    case "mention":
      return { subject: n.title, heading: n.title, intro: "You were tagged in a course conversation.", action: "View conversation" };
    case "announcement":
      return { subject: n.title, heading: n.title, intro: "Your instructor posted an announcement for your course.", action: "Read announcement" };
    case "connection_request":
      return { subject: `${actor} wants to connect with you`, heading: `${first} wants to connect`, intro: "Accept to message each other directly. Ignoring is private: they are not told.", action: "Review request" };
    default:
      return { subject: `${actor} accepted your connection request`, heading: `You're now connected with ${first}`, intro: "You can now message each other directly.", action: "Send a message" };
  }
}
// Cron (every minute): sends due notification emails, skipping anything already read or opted out.
export async function processNotificationEmails() {
  if (process.env.VERCEL_ENV !== "production" && process.env.TRAINING_EMAIL_MODE === "disabled") return;
  const db = getSupabaseAdmin();
  const live = process.env.TRAINING_EMAIL_MODE === "live" && process.env.VERCEL_ENV === "production";
  const origin = live ? "https://pacificwavedigital.com" : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3100";
  const rows = (checked(await db.rpc("pwd_lms_claim_notification_emails", { p_limit: 40 })) || []) as Row[];
  if (!rows.length) return;
  const set = (id: string, patch: Record<string, unknown>) => db.from("pwd_lms_notifications").update(patch).eq("id", id);
  const actors = await people(db, rows.map((r) => r.actor || "").filter(Boolean));
  const prefs = checked(
    await db.from("pwd_lms_profiles").select("user_id,message_emails").in("user_id", Array.from(new Set(rows.map((r) => r.user_id)))),
  ) || [];
  // Avatars in emails need a longer-lived link than the in-app one.
  const avatarPaths = checked(
    await db.from("pwd_lms_profiles").select("user_id,avatar_path").in("user_id", Array.from(actors.keys())),
  ) || [];
  for (const n of rows) {
    try {
      if ((isPeerNotification(n.kind) && (!n.actor || !(await allowedPeers(db, n.user_id, [n.actor])).has(n.actor))) || n.read_at || prefs.find((p) => p.user_id === n.user_id)?.message_emails === false) {
        await set(n.id, { email_state: "skipped" });
        continue;
      }
      const { data } = await db.auth.admin.getUserById(n.user_id);
      const email = data.user?.email;
      if (!email) {
        await set(n.id, { email_state: "skipped" });
        continue;
      }
      const actor = n.actor ? actors.get(n.actor) : undefined;
      const path = avatarPaths.find((a) => a.user_id === n.actor)?.avatar_path;
      const avatar = path
        ? (await db.storage.from("pwd-student-avatars").createSignedUrl(path, 604800)).data?.signedUrl || ""
        : "";
      const name = actor?.full_name || "Pacific Wave Digital";
      const c = copy(n, name);
      const signIn = (next: string) => `${origin}/training-center/account?mode=signin&next=${next}`;
      const content = notificationTemplate({
        heading: c.heading,
        intro: c.intro,
        actorName: name,
        actorHeadline: actor?.headline || "",
        actorAvatar: avatar,
        quote: n.body,
        action: c.action,
        url: n.link.startsWith("/") ? `${origin}${n.link}` : signIn("messages"),
        settingsUrl: signIn("messages"),
      });
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(12000),
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `pwd-notification-${n.id}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Pacific Wave Digital <noreply@pacificwavedigital.com>",
          to: live ? email : "delivered@resend.dev",
          subject: c.subject,
          ...content,
        }),
      });
      const result = response.ok ? await response.json() : null;
      if (!result?.id) throw Error(`Provider rejected notification email (${response.status})`);
      await Promise.all([
        set(n.id, { email_state: "sent", emailed_at: new Date().toISOString() }),
        db.from("pwd_lms_account_emails").insert({ email, purpose: `notify_${n.kind}`, state: live ? "accepted" : "test_accepted", provider_id: result.id }),
      ]);
    } catch (error) {
      await set(n.id, n.email_attempts >= 3 ? { email_state: "failed" } : { email_state: "pending", email_due_at: new Date(Date.now() + 120000).toISOString() });
      await reportServerError("lms/notification-email", error);
    }
  }
}
