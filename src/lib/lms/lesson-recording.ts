import { hasZoomRecording } from "./zoom-recordings";
import { lessonYouTubeIds } from "./youtube-recordings";
/** Live sessions become completable only after a replay has been attached. */
export function liveRecordingPending(lesson: { meeting_url?: string | null; recordings_published?: boolean; has_recording?: boolean; recording_path?: string | null; zoom_recording_url?: string | null; youtube_ids?: string[] | null; youtube_id?: string | null }) {
  return lesson.recordings_published === false || (Boolean(lesson.meeting_url) && !lesson.has_recording && !lesson.recording_path && !lessonYouTubeIds(lesson).length && !hasZoomRecording(lesson));
}
