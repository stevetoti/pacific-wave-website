/** Live sessions become completable only after a replay has been attached. */
export function liveRecordingPending(lesson: { meeting_url?: string | null; has_recording?: boolean; recording_path?: string | null; youtube_id?: string | null }) {
  return Boolean(lesson.meeting_url) && !lesson.has_recording && !lesson.recording_path && !lesson.youtube_id;
}
