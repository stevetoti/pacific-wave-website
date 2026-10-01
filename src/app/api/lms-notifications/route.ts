import { NextResponse } from "next/server";
import { z } from "zod";
import { checked, student } from "@/lib/server/lms";
import { apiError, readJson } from "@/lib/server/http";
import { allowedPeers, isPeerNotification } from "@/lib/server/messaging-scope";
import { people } from "@/lib/server/messages";
export const dynamic = "force-dynamic";
const json = (d: unknown) =>
  NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  try {
    const { db, user } = await student(request);
    const [rows, unread] = await Promise.all([
      db
        .from("pwd_lms_notifications")
        .select("id,kind,actor,group_key,title,body,link,count,created_at,updated_at,read_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(30),
      db
        .from("pwd_lms_notifications")
        .select("id,kind,actor")
        .eq("user_id", user.id)
        .is("read_at", null),
    ]);
    if (unread.error) throw unread.error;
    const all = [...(checked(rows) || []), ...(checked(unread) || [])];
    const scope = await allowedPeers(db, user.id, all.filter(i => isPeerNotification(i.kind) && i.actor).map(i => i.actor));
    const visible = (i: {kind: string; actor: string | null}) => !isPeerNotification(i.kind) || Boolean(i.actor && scope.has(i.actor));
    const items = (checked(rows) || []).filter(visible);
    const actors = await people(db, items.map((i) => i.actor).filter(Boolean) as string[]);
    return json({
      unread: (checked(unread) || []).filter(visible).length,
      items: items.map((i) => ({ ...i, actor: i.actor ? actors.get(i.actor) || null : null })),
    });
  } catch (e) {
    return apiError(e, "lms-notifications/get");
  }
}
export async function POST(request: Request) {
  try {
    const { db, user } = await student(request);
    const input = await readJson(
      request,
      z.discriminatedUnion("action", [
        z.object({ action: z.literal("read"), ids: z.array(z.uuid()).min(1).max(50) }),
        z.object({ action: z.literal("read_all") }),
      ]),
    );
    let q = db
      .from("pwd_lms_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    if (input.action === "read") q = q.in("id", input.ids);
    checked(await q);
    return json({ success: true });
  } catch (e) {
    return apiError(e, "lms-notifications/post");
  }
}
