"use client";
import { useState } from 'react';
import { lessonYouTubeIds, MAX_YOUTUBE_RECORDINGS, type YouTubeRecordings } from '@/lib/lms/youtube-recordings';

export default function YouTubeRecordingFields({ lesson }: { lesson: YouTubeRecordings }) {
  const [rows, setRows] = useState(() => {
    const ids = lessonYouTubeIds(lesson);
    return (ids.length ? ids : ['']).map((value, key) => ({ key, value }));
  });
  const [nextKey, setNextKey] = useState(rows.length);
  return <fieldset style={{ minWidth: 0 }}>
    <legend>YouTube recordings</legend>
    <p className="lms-muted">Paste each YouTube link in order. Students will see Part 1, Part 2 and so on. Click Save lesson when finished. Unlisted links can be shared by viewers.</p>
    {rows.map((row, index) => <div key={row.key} style={{ marginBottom: 16 }}>
      <label>YouTube recording {index + 1}
        <input name="youtube_links" value={row.value} placeholder="https://www.youtube.com/watch?v=…" maxLength={2048}
          onChange={e => setRows(rows.map(item => item.key === row.key ? { ...item, value: e.target.value } : item))} />
      </label>
      <button type="button" className="lms-button secondary" aria-label={`Remove recording ${index + 1}`}
        onClick={() => setRows(rows.filter(item => item.key !== row.key))}>Remove</button>
    </div>)}
    <button type="button" className="lms-button secondary" disabled={rows.length >= MAX_YOUTUBE_RECORDINGS}
      onClick={() => { setRows([...rows, { key: nextKey, value: '' }]); setNextKey(nextKey + 1); }}>Add another video</button>
  </fieldset>;
}
