import { queueOwnerNotification, sendOwnerNotifications } from "@/lib/server/owner-notifications";
import { after, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { student, checked } from "@/lib/server/lms";
import { profileSchema, emptyProfile } from "@/lib/lms/profile";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  try {
    const { db, user } = await student(request);
    const [p, o] = await Promise.all([
      db
        .from("pwd_lms_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      db
        .from("pwd_lms_orders")
        .select("id,course_id,name,phone")
        .eq("user_id", user.id)
        .order("created_at"),
    ]);
    const saved = checked(p),
      orders = checked(o) || [],
      profile = {
        ...emptyProfile,
        full_name: orders[0]?.name || "",
        phone: orders[0]?.phone || "",
        ...saved,
        avatar_url: "",
      };
    if (profile.avatar_path) {
      const signed = checked(
        await db.storage
          .from("pwd-student-avatars")
          .createSignedUrl(profile.avatar_path, 3600),
      );
      profile.avatar_url = signed?.signedUrl || "";
    }
    if (new URL(request.url).searchParams.get("summary") === "1")
      return json({ profile: { full_name: profile.full_name, avatar_url: profile.avatar_url } });
    const ids = Array.from(new Set(orders.map((o) => o.course_id)));
    const [c, l] = ids.length
      ? await Promise.all([
          db.from("pwd_lms_courses").select("*").in("id", ids),
          db
            .from("pwd_lms_lessons")
            .select("id,course_id,title,starts_at,published,order_id,quiz")
            .in("course_id", ids)
            .or(
              `order_id.is.null,order_id.in.(${orders.map((o) => o.id).join(",")})`,
            )
            .order("position"),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ];
    const courses = checked(c) || [],
      lessons = (checked(l) || [])
        .filter(
          (l) =>
            !courses.find((c) => c.id === l.course_id)?.private_sessions ||
            orders.some(
              (o) => o.id === l.order_id && o.course_id === l.course_id,
            ),
        )
        .map((l) => ({
          id: l.id,
          course_id: l.course_id,
          title: l.title,
          starts_at: l.starts_at,
          published: l.published,
          has_quiz: Array.isArray(l.quiz) && l.quiz.length > 0,
        }));
    return json({
      profile: { ...profile, avatar_path: undefined, user_id: undefined },
      courses,
      lessons,
      joined_at: user.created_at,
    });
  } catch (e) {
    return apiError(e, "student-profile/read");
  }
}
export async function POST(request: Request) {
  try {
    const { db, user } = await student(request);
    await rateLimit(request, `lms-profile-${user.id}`, 30);
    const action = new URL(request.url).searchParams.get("action");
    if (action === "avatar" || action === "remove-avatar") {
      const previous = checked(
        await db
          .from("pwd_lms_profiles")
          .select("avatar_path")
          .eq("user_id", user.id)
          .maybeSingle(),
      );
      let path = "";
      if (action === "avatar") {
        const reader = request.body?.getReader();
        if (!reader) throw new HttpError(400, "Choose a profile photo.");
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 3145728) {
            await reader.cancel();
            throw new HttpError(413, "Choose an image smaller than 3 MB.");
          }
          chunks.push(value);
        }
        let bytes: Buffer;
        try {
          const photo = sharp(Buffer.concat(chunks), {
            limitInputPixels: 25000000,
          });
          const meta = await photo.metadata();
          if (!["jpeg", "png", "webp"].includes(meta.format || ""))
            throw Error("Unsupported format");
          bytes = await photo
            .rotate()
            .resize(384, 384, { fit: "cover" })
            .webp({ quality: 85 })
            .toBuffer();
        } catch {
          throw new HttpError(400, "Choose a valid JPG, PNG or WebP photo.");
        }
        path = `${user.id}/${randomUUID()}.webp`;
        checked(
          await db.storage
            .from("pwd-student-avatars")
            .upload(path, bytes, { contentType: "image/webp" }),
        );
      }
      const result = await db
        .from("pwd_lms_profiles")
        .upsert({
          user_id: user.id,
          avatar_path: path,
          updated_at: new Date().toISOString(),
        });
      if (result.error) {
        if (path) await db.storage.from("pwd-student-avatars").remove([path]);
        throw result.error;
      }
      if (previous?.avatar_path)
        await db.storage
          .from("pwd-student-avatars")
          .remove([previous.avatar_path]);
      const signed = path
        ? checked(
            await db.storage
              .from("pwd-student-avatars")
              .createSignedUrl(path, 3600),
          )
        : null;
      await queueOwnerNotification(`profile-photo-${randomUUID()}`, "Student profile photo updated", `Student: ${user.email}\nAction: ${action}`);
      after(sendOwnerNotifications);
      return json({ avatar_url: signed?.signedUrl || "" });
    }
    if (action) throw new HttpError(400, "Unknown profile action.");
    const input = await readJson(request, profileSchema);
    checked(
      await db
        .from("pwd_lms_profiles")
        .upsert({
          ...input,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }),
    );
    await queueOwnerNotification(`profile-${randomUUID()}`, "Student profile updated", `Student: ${user.email}\nName: ${input.full_name}\nThe student saved their profile. Private biography and learning goals are not included in this alert.`);
    after(sendOwnerNotifications);
    return json({ success: true });
  } catch (e) {
    return apiError(e, "student-profile/write");
  }
}
