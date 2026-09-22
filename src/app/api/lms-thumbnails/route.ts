import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { authorize } from "@/lib/server/auth";
import { checked } from "@/lib/server/lms";
import { HttpError, apiError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  encodeLessonThumbnail,
  thumbnailBucket,
} from "@/lib/server/lesson-thumbnails";
export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db, user } = auth;
    await rateLimit(request, `lesson-thumbnail-${user.id}`, 30);
    const course = z
      .uuid()
      .safeParse(new URL(request.url).searchParams.get("course"));
    if (!course.success) throw new HttpError(400, "Select a course first.");
    const row = checked(
      await db
        .from("pwd_lms_courses")
        .select("id")
        .eq("id", course.data)
        .maybeSingle(),
    );
    if (!row) throw new HttpError(404, "Course not found.");
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, "Choose an image.");
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
    const bytes = await encodeLessonThumbnail(Buffer.concat(chunks));
    const path = `${course.data}/${randomUUID()}.webp`;
    checked(
      await db.storage
        .from(thumbnailBucket)
        .upload(path, bytes, { contentType: "image/webp" }),
    );
    const signed = checked(
      await db.storage.from(thumbnailBucket).createSignedUrl(path, 3600),
    );
    return NextResponse.json(
      { path, url: signed!.signedUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "lms/thumbnail-upload");
  }
}
