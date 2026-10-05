"use client";
import { useState } from 'react';
import { lessonYouTubeIds, type YouTubeRecordings as RecordingData } from '@/lib/lms/youtube-recordings';

export default function YouTubeRecordings({ lesson }: { lesson: RecordingData & { title: string } }) {
  const ids = lessonYouTubeIds(lesson);
  const [playing, setPlaying] = useState<string | null>(null);
  if (!ids.length) return null;
  return <section aria-label="Class recordings">
    <h3>Class recording{ids.length > 1 ? 's' : ''}</h3>
    {ids.length > 1 && <p className="lms-muted">This class has {ids.length} parts. Watch them in order.</p>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
      {ids.map((id, index) => <button key={id} type="button" className="lms-button" aria-pressed={playing === id}
        onClick={() => setPlaying(id)}>{ids.length > 1 ? `Watch Part ${index + 1}` : 'Load class recording'}</button>)}
    </div>
    {playing && ids.includes(playing) && <iframe key={playing} className="lms-video"
      src={`https://www.youtube-nocookie.com/embed/${playing}`} title={`${lesson.title} — Part ${ids.indexOf(playing) + 1}`}
      allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />}
  </section>;
}
