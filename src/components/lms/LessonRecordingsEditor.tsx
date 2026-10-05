"use client";
import { useState } from 'react';
import { authFetch } from '@/lib/auth-fetch';
import { supabase } from '@/lib/supabase';
import { lessonYouTubeIds, parseYouTubeRecording } from '@/lib/lms/youtube-recordings';
import type { Lesson } from '@/lib/lms/types';
import YouTubeRecordingFields from './YouTubeRecordingFields';

export default function LessonRecordingsEditor({ lesson, privateSessions, onSaved }: {
  lesson: Lesson; privateSessions: boolean; onSaved: () => Promise<void>;
}) {
  const [path, setPath] = useState(lesson.recording_path || '');
  const [published, setPublished] = useState(lesson.recordings_published !== false && Boolean(path || lessonYouTubeIds(lesson).length));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  async function request(body: unknown) {
    const r = await authFetch('/api/lms/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw Error(d.error || 'Recording could not be saved.');
    return d;
  }
  return <form className="lms-panel" aria-label="Recordings editor" onChange={() => { setDirty(true); setMessage(''); }} onSubmit={async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const intent = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') || 'draft';
    setBusy(true); setError(''); setMessage('');
    try {
      const links = new FormData(form).getAll('youtube_links').map(String).map(v => v.trim()).filter(Boolean);
      const parsed = links.map(parseYouTubeRecording);
      if (parsed.some(v => !v)) throw Error('Enter a valid YouTube video link or 11-character ID for every part.');
      const ids = Array.from(new Set(parsed.filter((v): v is string => v !== null)));
      const d = await request({ action: 'recordings', lesson_id: lesson.id, course_id: lesson.course_id, youtube_ids: ids, recording_path: path, publish: intent === 'publish' });
      setPublished(d.published); setDirty(false);
      setMessage(d.published ? 'Recordings published. Approved students can now watch them in this class.' : 'Recording draft saved. Students cannot watch it until you publish.');
      await onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'Recording could not be saved.'); }
    finally { setBusy(false); }
  }}>
    <h2>Class recordings</h2>
    <p><strong>{published ? 'Published to students' : 'Not published to students'}</strong>{dirty ? ' · Unsaved recording changes' : ''}</p>
    <p>Save and publish recordings here, separately from the live meeting and lesson settings below.</p>
    {error && <p role="alert" className="lms-alert">{error}</p>}
    {message && <p role="status" className="lms-notice">{message}</p>}
    <fieldset disabled={busy} style={{ minWidth: 0 }}>
      {!privateSessions && <YouTubeRecordingFields lesson={lesson} />}
      <h3>{privateSessions ? 'Private recording upload' : 'Or upload a recording'}</h3>
      <p className="lms-muted">MP4 or WebM, up to 500 MB. Uploading prepares a draft; click Publish recordings when ready.</p>
      <input aria-label="Upload class recording" type="file" accept="video/mp4,video/webm" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        setBusy(true); setError(''); setMessage('');
        try {
          if (file.size > 524288000) throw Error('Recording must be 500 MB or smaller.');
          if (!['video/mp4', 'video/webm'].includes(file.type)) throw Error('Choose an MP4 or WebM video.');
          const d = await request({ action: 'recording_upload', course_id: lesson.course_id, order_id: lesson.order_id || null, extension: file.type === 'video/webm' ? 'webm' : 'mp4' });
          const upload = await supabase.storage.from('pwd-mentorship-recordings').uploadToSignedUrl(d.path, d.token, file, { contentType: file.type });
          if (upload.error) throw upload.error;
          setPath(d.path); setDirty(true); setMessage('Upload complete. Click Publish recordings to make it available to students.');
        } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed.'); }
        finally { setBusy(false); }
      }} />
      {path && <p>Uploaded video attached. <button type="button" className="lms-text" onClick={() => { setPath(''); setDirty(true); setMessage(''); }}>Remove uploaded video</button></p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
        <button className="lms-button" type="submit" value="publish">{busy ? 'Saving…' : 'Publish recordings'}</button>
        <button className="lms-button" type="submit" value="draft">Save recording draft</button>
        {published && <button className="lms-button" type="button" onClick={async () => {
          setBusy(true); setError(''); setMessage('');
          try { await request({ action: 'recordings_unpublish', lesson_id: lesson.id, course_id: lesson.course_id }); setPublished(false); setMessage('Recordings hidden from students. Your live class remains available.'); await onSaved(); }
          catch(err) { setError(err instanceof Error ? err.message : 'Unable to hide recordings.'); }
          finally { setBusy(false); }
        }}>Unpublish recordings</button>}
      </div>
      <p className="lms-muted">Saving a draft hides the recordings until you publish again. Your live meeting settings stay unchanged.</p>
    </fieldset>
  </form>;
}
