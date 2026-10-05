export const MAX_YOUTUBE_RECORDINGS = 20;
const idPattern = /^[A-Za-z0-9_-]{11}$/;

/** Accept a video ID or a link to a specific video, never arbitrary embed HTML. */
export function parseYouTubeRecording(value: string): string | null {
  const text = value.trim();
  if (idPattern.test(text)) return text;
  try {
    const url = new URL(text);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.slice(1);
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1] || null;
    }
    return id && idPattern.test(id) ? id : null;
  } catch { return null; }
}

export type YouTubeRecordings = { youtube_id?: string | null; youtube_ids?: string[] | null };
export function lessonYouTubeIds(lesson: YouTubeRecordings): string[] {
  return Array.from(new Set((lesson.youtube_ids?.length ? lesson.youtube_ids : [lesson.youtube_id || '']).filter(id => idPattern.test(id))));
}
