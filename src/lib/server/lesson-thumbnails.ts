import "server-only";
import sharp from "sharp";
import { getSupabaseAdmin } from "./clients";
import { reportServerError } from "./report-error";
import { HttpError } from "./http";
export const thumbnailBucket = "pwd-lesson-thumbnails";
export async function encodeLessonThumbnail(input: Buffer) {
  try {
    const photo = sharp(input, { limitInputPixels: 25000000 });
    const metadata = await photo.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format || "")) throw Error();
    return await photo
      .rotate()
      .resize(960, 540, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new HttpError(400, "Choose a valid JPG, PNG or WebP image.");
  }
}
export async function withLessonThumbnails<
  T extends { thumbnail_path?: string },
>(lessons: T[]) {
  const paths = Array.from(
    new Set(
      lessons
        .map((l) => l.thumbnail_path)
        .filter((p): p is string => Boolean(p)),
    ),
  );
  const result = paths.length
    ? await getSupabaseAdmin()
        .storage.from(thumbnailBucket)
        .createSignedUrls(paths, 3600)
    : { data: [], error: null };
  if (result.error)
    await reportServerError("lms/thumbnail-previews", result.error);
  const signed = result.data || [];
  const urls = new Map((signed || []).map((s) => [s.path, s.signedUrl]));
  return lessons.map((l) => ({
    ...l,
    thumbnail_url: urls.get(l.thumbnail_path || "") || "",
  }));
}
