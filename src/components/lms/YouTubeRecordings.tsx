"use client";
import { CourseText } from "@/components/lms/CourseLanguage";
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { lessonYouTubeIds, type YouTubeRecordings as RecordingData } from '@/lib/lms/youtube-recordings';

export default function YouTubeRecordings({ lesson }: { lesson: RecordingData & { title: string } }) {
  const ids = lessonYouTubeIds(lesson);
  const [playing, setPlaying] = useState<string | null>(null);
  const player = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (playing) {
      player.current?.focus({ preventScroll: true });
      player.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [playing]);
  if (!ids.length) return null;
  return <section aria-label="Class recordings">
    <h3><CourseText text={ids.length > 1 ? 'Class recordings' : 'Class recording'} /></h3>
    <p className="lms-muted"><CourseText text={ids.length > 1 ? `This class has ${ids.length} parts. Select a video below to watch in order.` : 'Your recording is ready. Select the video to watch here.'} /></p>
    <div className="pwd-replay-grid">
      {ids.map((id, index) => <button key={id} type="button" className="pwd-replay-card" aria-pressed={playing === id}
        aria-label={`Watch Part ${index + 1}`} onClick={() => setPlaying(id)}>
        <span className="pwd-replay-art">
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={`${lesson.title} — Part ${index + 1} video preview`}
            width={480} height={360} unoptimized onError={e => { if (!e.currentTarget.src.endsWith('/images/training/hero.webp')) e.currentTarget.src = '/images/training/hero.webp'; }} />
          <span className="pwd-replay-play"><Play size={28} fill="currentColor" aria-hidden="true" /></span>
          <span className="pwd-replay-ready"><CourseText text={"Recording ready"} /></span>
        </span>
        <span className="pwd-replay-caption"><strong><CourseText text={"Part"} />{index + 1}</strong><span><CourseText text={playing === id ? 'Selected · player below' : 'Watch inside your course'} /></span></span>
      </button>)}
    </div>
    {playing && ids.includes(playing) && <div ref={player} tabIndex={-1} className="pwd-replay-player" aria-label={`Recording Part ${ids.indexOf(playing) + 1}`}>
      <h4><CourseText text={lesson.title} /><CourseText text={"· Part"} />{ids.indexOf(playing) + 1}</h4>
      <iframe key={playing} className="lms-video" style={{ minHeight: 200 }}
        src={`https://www.youtube-nocookie.com/embed/${playing}?playsinline=1`} title={`${lesson.title} — Part ${ids.indexOf(playing) + 1}`}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen />
      <p className="lms-muted"><CourseText text={"If YouTube asks you to sign in, open this video on YouTube to complete its verification."} /></p>
      <a href={`https://www.youtube.com/watch?v=${playing}`} target="_blank" rel="noopener" referrerPolicy="strict-origin-when-cross-origin" className="lms-text"><CourseText text={"Open Part"} />{ids.indexOf(playing) + 1}<CourseText text={"on YouTube"} /><ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>}
  </section>;
}
