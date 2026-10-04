import "server-only";
import { createHmac } from "node:crypto";
import { HttpError } from "./http";
/** Attendee-only, meeting-bound signature. The client cannot choose its role or meeting. */
export function zoomAttendeeSignature(meetingNumber: string, now = Date.now()) {
  const sdkKey = process.env.ZOOM_MEETING_SDK_CLIENT_ID;
  const secret = process.env.ZOOM_MEETING_SDK_CLIENT_SECRET;
  if (!sdkKey || !secret) throw new HttpError(503, "The embedded classroom is not ready yet. Please use Open in Zoom.");
  if (!/^\d{9,11}$/.test(meetingNumber)) throw new HttpError(400, "Invalid Zoom meeting.");
  const iat = Math.floor(now / 1000) - 30;
  const exp = iat + 1800;
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = encode({ alg: "HS256", typ: "JWT" }) + "." + encode({
    appKey: sdkKey, sdkKey, mn: meetingNumber, role: 0, iat, exp, tokenExp: exp,
  });
  return { sdkKey, signature: unsigned + "." + createHmac("sha256", secret).update(unsigned).digest("base64url") };
}
