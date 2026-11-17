'use client';
import { ExternalLink, PlayCircle } from 'lucide-react';
import { hasZoomRecording, parseZoomRecording, type ZoomRecording as Recording } from '@/lib/lms/zoom-recordings';
import { CourseText } from './CourseLanguage';

export default function ZoomRecording({ lesson }: { lesson: Recording & { recordings_published?: boolean } }) {
  if (lesson.recordings_published === false || !hasZoomRecording(lesson)) return null;
  return <section aria-label="Zoom class recording" className="lms-panel" style={{ minWidth: 0, marginBottom: 20 }}>
    <h3><CourseText text="Class recording on Zoom" /></h3>
    <p><CourseText text="Watch this class in Zoom’s recording player. No download is needed." /></p>
    <a className="lms-button" href={parseZoomRecording(lesson.zoom_recording_url!)!} target="_blank" rel="noopener noreferrer">
      <PlayCircle size={18} aria-hidden="true" /><CourseText text="Watch recording" /><ExternalLink size={16} aria-hidden="true" />
    </a>
    {lesson.zoom_recording_passcode && <p style={{ overflowWrap: 'anywhere' }}><CourseText text="Recording passcode" />: <code style={{ userSelect: 'all' }}>{lesson.zoom_recording_passcode}</code></p>}
    <p className="lms-muted"><CourseText text="Opens in a new tab. Enter the recording passcode if Zoom asks for it." /></p>
  </section>;
}
