import { z } from 'zod';

/** Accept Zoom recording share/player pages, never live meetings or arbitrary embeds. */
export function parseZoomRecording(value: string): string | null {
  const text = value.trim();
  if (!text || text.length > 2048) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    if (!(url.hostname === 'zoom.us' || /^[a-z0-9-]+\.zoom\.us$/.test(url.hostname))) return null;
    if (!/^\/rec\/(share|play)\/[A-Za-z0-9_.~-]+\/?$/.test(url.pathname)) return null;
    url.hash = '';
    return url.toString();
  } catch { return null; }
}
export const zoomRecordingUrlSchema = z.string().trim().max(2048).refine(value => !value || Boolean(parseZoomRecording(value)), 'Use an HTTPS Zoom cloud recording share or play link.').transform(value => value ? parseZoomRecording(value)! : '');
export const zoomRecordingPasscodeSchema = z.string().trim().max(100);
export type ZoomRecording = { zoom_recording_url?: string | null; zoom_recording_passcode?: string | null };
export function hasZoomRecording(lesson: ZoomRecording): boolean {
  return Boolean(lesson.zoom_recording_url && parseZoomRecording(lesson.zoom_recording_url));
}
/** Keep recording URLs/passcodes out of unpaid, unpublished and draft course responses. */
export function studentZoomRecording(lesson: ZoomRecording & { published: boolean; recordings_published?: boolean }, status: string): Required<ZoomRecording> {
  const allowed = ['paid', 'granted'].includes(status) && lesson.published && lesson.recordings_published !== false && hasZoomRecording(lesson);
  return { zoom_recording_url: allowed ? parseZoomRecording(lesson.zoom_recording_url!) : '', zoom_recording_passcode: allowed ? lesson.zoom_recording_passcode || '' : '' };
}
