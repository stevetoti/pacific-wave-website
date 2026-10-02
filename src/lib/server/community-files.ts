import "server-only";
import sharp from "sharp";
import { COMMUNITY_FILE_LIMIT, MEDIA_TYPES, mediaLimit } from "../lms/community";
import { randomUUID } from "node:crypto";
import { access, channelAccess } from "./community";
import { checked } from "./lms";
import { HttpError } from "./http";
import { rateLimit } from "./rate-limit";
export const bucket = "pwd-community-files";
export const mediaBucket = "pwd-community-media";
// Video/audio paths start with "media/" and live in their own bucket.
export const bucketFor = (path: string) => (path.startsWith("media/") ? mediaBucket : bucket);
// Reads and validates an uploaded chat file: JPG/PNG/WebP (converted to WebP), PDF or UTF-8 text, max 4 MB.
export async function readChatFile(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Choose a file.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > COMMUNITY_FILE_LIMIT) {
      await reader.cancel();
      throw new HttpError(413, "Choose a file smaller than 4 MB.");
    }
    chunks.push(value);
  }
  let bytes = Buffer.concat(chunks),
    mime = "",
    extension = "";
  if (!bytes.length) throw new HttpError(400, "The file is empty.");
  const original = (new URL(request.url).searchParams.get("name") || "File")
    .replace(/[\r\n\x00-\x1f/\\]/g, "")
    .slice(0, 160);
  if (bytes.subarray(0, 5).toString() === "%PDF-") {
    mime = "application/pdf";
    extension = "pdf";
  } else if (
    request.headers.get("content-type")?.split(";")[0] === "text/plain"
  ) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (bytes.includes(0)) throw Error();
    } catch {
      throw new HttpError(400, "Choose a UTF-8 text file.");
    }
    mime = "text/plain";
    extension = "txt";
  } else {
    try {
      const file = sharp(bytes, { limitInputPixels: 25000000 });
      const meta = await file.metadata();
      if (!["jpeg", "png", "webp"].includes(meta.format || "")) throw Error();
      bytes = await file
        .rotate()
        .resize(1800, 1800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      mime = "image/webp";
      extension = "webp";
    } catch {
      throw new HttpError(
        400,
        "Supported files: JPG, PNG, WebP, PDF or plain text.",
      );
    }
  }
  if (bytes.length > COMMUNITY_FILE_LIMIT)
    throw new HttpError(
      413,
      "Choose a smaller image (maximum 4 MB after conversion).",
    );
  return { bytes, mime, extension, original };
}
export async function uploadCommunityFile(
  request: Request,
  course: string,
  channelId: string,
) {
  const ctx = await access(request, course),
    channel = await channelAccess(ctx, course, channelId);
  if (
    channel.archived ||
    (!ctx.instructor && (channel.locked || channel.announcements))
  )
    throw new HttpError(403, "Posting is closed in this conversation.");
  await rateLimit(request, `community-upload-${ctx.user.id}`, 12);
  const { bytes, mime, extension, original } = await readChatFile(request);
  const id = randomUUID(),
    path = `${channelId}/${ctx.user.id}/${id}.${extension}`,
    name = original.replace(/\.[^.]+$/, "") + "." + extension;
  checked(
    await ctx.db.storage
      .from(bucket)
      .upload(path, bytes, { contentType: mime }),
  );
  const result = await ctx.db.from("pwd_lms_chat_files").insert({
    id,
    channel_id: channelId,
    user_id: ctx.user.id,
    path,
    name,
    mime,
    size: bytes.length,
  });
  if (result.error) {
    await ctx.db.storage.from(bucket).remove([path]);
    throw result.error;
  }
  return { id, name, mime, size: bytes.length };
}
// Video or audio: reserve a file record and return a one-time signed upload link.
export async function createMediaUpload(
  request: Request,
  course: string,
  channelId: string,
  input: { name: string; mime: string; size: number },
) {
  const ctx = await access(request, course),
    channel = await channelAccess(ctx, course, channelId);
  if (channel.archived || (!ctx.instructor && (channel.locked || channel.announcements)))
    throw new HttpError(403, "Posting is closed in this conversation.");
  await rateLimit(request, `community-media-${ctx.user.id}`, 10);
  const type = MEDIA_TYPES[input.mime];
  if (!type) throw new HttpError(400, "Supported media: MP4, WebM or MOV video; MP3, M4A, AAC, WebM, OGG or WAV audio.");
  const limit = mediaLimit(ctx.instructor, type.kind);
  if (input.size < 1 || input.size > limit)
    throw new HttpError(413, `Choose a ${type.kind} smaller than ${Math.round(limit / 1048576)} MB.`);
  const id = randomUUID(),
    path = `media/${channelId}/${ctx.user.id}/${id}.${type.ext}`,
    name = input.name.replace(/[\r\n\x00-\x1f/\\]/g, "").replace(/\.[^.]+$/, "").slice(0, 150) + "." + type.ext;
  const upload = checked(await ctx.db.storage.from(mediaBucket).createSignedUploadUrl(path));
  checked(
    await ctx.db.from("pwd_lms_chat_files").insert({ id, channel_id: channelId, user_id: ctx.user.id, path, name, mime: input.mime, size: input.size }),
  );
  return { file: { id, name, mime: input.mime, size: input.size }, path, token: upload!.token };
}
// Before a message is sent, confirm uploaded media really exists and is within the limit.
export async function verifyMedia(db: Awaited<ReturnType<typeof access>>["db"], fileIds: string[], instructor: boolean) {
  if (!fileIds.length) return;
  const rows = checked(await db.from("pwd_lms_chat_files").select("id,path,mime").in("id", fileIds)) || [];
  for (const f of rows.filter((r) => r.path.startsWith("media/"))) {
    const folder = f.path.slice(0, f.path.lastIndexOf("/"));
    const { data } = await db.storage.from(mediaBucket).list(folder, { search: f.path.slice(folder.length + 1) });
    const size = Number(data?.[0]?.metadata?.size || 0);
    const type = MEDIA_TYPES[f.mime];
    if (!size) throw new HttpError(400, "Your video or audio is still uploading. Please wait and try again.");
    if (!type || size > mediaLimit(instructor, type.kind)) throw new HttpError(413, "That video or audio is larger than allowed.");
    await db.from("pwd_lms_chat_files").update({ size }).eq("id", f.id);
  }
}
async function allowedFile(request: Request, course: string, channelId: string, fileId: string) {
  const ctx = await access(request, course);
  await channelAccess(ctx, course, channelId);
  const file = checked(
    await ctx.db
      .from("pwd_lms_chat_files")
      .select("*")
      .eq("id", fileId)
      .eq("channel_id", channelId)
      .maybeSingle(),
  );
  if (!file) throw new HttpError(404, "File unavailable.");
  if (file.message_id) {
    const message = checked(
      await ctx.db
        .from("pwd_lms_messages")
        .select("deleted")
        .eq("id", file.message_id)
        .eq("channel_id", channelId)
        .single(),
    );
    if (!message || message.deleted)
      throw new HttpError(404, "Message removed.");
  } else if (file.user_id !== ctx.user.id)
    throw new HttpError(404, "File unavailable.");
  return { ctx, file };
}
// Short-lived private link for showing an image or playing video/audio in the chat.
export async function communityFileUrl(request: Request, course: string, channelId: string, fileId: string) {
  const { ctx, file } = await allowedFile(request, course, channelId, fileId);
  const signed = checked(await ctx.db.storage.from(bucketFor(file.path)).createSignedUrl(file.path, 3600));
  return { url: signed!.signedUrl, mime: file.mime, name: file.name };
}
export async function downloadCommunityFile(
  request: Request,
  course: string,
  channelId: string,
  fileId: string,
) {
  const { ctx, file } = await allowedFile(request, course, channelId, fileId);
  const blob = checked(await ctx.db.storage.from(bucketFor(file.path)).download(file.path));
  if (!blob) throw new HttpError(404, "File unavailable.");
  return new Response(blob, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
