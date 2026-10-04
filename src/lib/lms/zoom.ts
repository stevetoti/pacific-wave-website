/** Only standard Zoom Meetings links are embeddable. Other providers retain their external link. */
export function zoomMeetingNumber(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (!/^(?:[a-z0-9-]+\.)*zoom\.us$/i.test(url.hostname)) return null;
    return url.pathname.match(/^\/(?:j|wc\/join)\/(\d{9,11})\/?$/)?.[1] ?? null;
  } catch { return null; }
}
export type ZoomJoin = {
  signature: string; sdkKey: string; meetingNumber: string;
  passWord: string; userName: string;
};
