"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Video, ExternalLink, X, CalendarDays, Maximize2, PanelLeft, Headphones, Monitor } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { zoomMeetingNumber, type ZoomJoin } from "@/lib/lms/zoom";
import "./zoom-classroom.css";

type ClassroomProps = {
  lessonId: string;
  meetingUrl: string;
  title: string;
  courseTitle: string;
  artwork: string;
  schedule?: string;
  classNumber: number;
};
const fallbackArtwork = "/images/training/hero.webp";
export default function ZoomClassroom({ lessonId, meetingUrl, title, courseTitle, artwork, schedule, classNumber }: ClassroomProps) {
  const [state, setState] = useState<"idle" | "loading" | "open">("idle");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [cover, setCover] = useState(artwork || fallbackArtwork);
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const join = useRef<ZoomJoin | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);
  const embeddable = Boolean(zoomMeetingNumber(meetingUrl));
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; join.current = null; }; }, []);
  useEffect(() => {
    if (state !== "open") return;
    const modal = dialog.current;
    const returnFocus = trigger.current;
    modal?.showModal();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "pwd-zoom-ready" && join.current) {
        frame.current?.contentWindow?.postMessage({ type: "pwd-zoom-join", payload: join.current }, window.location.origin);
        join.current = null;
      } else if (event.data?.type === "pwd-zoom-left") {
        setState("idle"); trigger.current?.focus();
      } else if (event.data?.type === "pwd-zoom-error") {
        setError("Zoom could not connect in this browser. Try again or use Open in Zoom.");
      }
    };
    window.addEventListener("message", receive);
    return () => { modal?.close(); document.body.style.overflow = original; window.removeEventListener("message", receive); returnFocus?.focus(); };
  }, [state]);
  async function connect() {
    setError(""); setState("loading");
    try {
      const response = await authFetch("/api/lms-zoom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not open the classroom.");
      if (!mounted.current) return;
      join.current = data; setState("open");
    } catch (e) {
      if (mounted.current) { setError(e instanceof Error ? e.message : "Could not open the classroom."); setState("idle"); }
    }
  }
  function close() { join.current = null; setState("idle"); trigger.current?.focus(); }
  const artworkImage = (className: string) => <div className={className}><Image src={cover} alt="" fill sizes="(max-width: 700px) 80px, 300px" unoptimized onError={() => setCover(fallbackArtwork)} /></div>;
  return <section className="pwd-live-card" aria-label="Live classroom">
    {artworkImage("pwd-live-card-art")}
    <div className="pwd-live-card-content">
      <span className="pwd-live-eyebrow"><Video size={15} /> PWD LIVE CLASSROOM</span>
      <h3>{title}</h3>
      <p>{courseTitle}</p>
      <div className="pwd-live-actions">
        {embeddable && <button ref={trigger} className="lms-button" disabled={state === "loading"} onClick={connect}>{state === "loading" ? "Opening classroom…" : "Join inside dashboard"}</button>}
        <a className="lms-button secondary" href={meetingUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />{embeddable ? "Open in Zoom" : "Join live class"}</a>
      </div>
      {error && state !== "open" && <p role="alert">{error}</p>}
    </div>
    {state === "open" && createPortal(<dialog ref={dialog} className={"pwd-live-overlay" + (focused ? " pwd-live-focused" : "")} aria-label={title + " — Live classroom"} onCancel={event => { event.preventDefault(); close(); }}>
      <header className="pwd-classroom-header">
        <div className="pwd-classroom-brand"><Image src="/images/training/pwd-logo.png" alt="Pacific Wave Digital logo" width={44} height={44} /><div><strong>Pacific Wave Digital</strong><span>TRAINING CENTRE</span></div></div>
        <div className="pwd-classroom-heading"><span>{courseTitle}</span><strong>{title}</strong></div>
        <div className="pwd-classroom-controls">
          <button onClick={() => setFocused(value => !value)} aria-pressed={focused} aria-label={focused ? "Show class details" : "Focus on meeting"}>{focused ? <PanelLeft size={18} /> : <Maximize2 size={18} />}<span>{focused ? "Class details" : "Focus view"}</span></button>
          <button ref={closeButton} onClick={close} aria-label="Leave classroom and return to course"><X size={19} /><span>Return to course</span></button>
        </div>
      </header>
      <div className="pwd-classroom-body">
        <aside className="pwd-classroom-details" aria-label="Class details">
          {artworkImage("pwd-classroom-art")}
          <div className="pwd-classroom-course">
            <span className="pwd-live-eyebrow">YOUR LIVE CLASSROOM</span>
            <h2>{courseTitle}</h2>
            <div className="pwd-classroom-lesson"><span className="pwd-classroom-number">{String(classNumber).padStart(2,"0")}</span><div><span>THIS SESSION</span><h3>{title}</h3></div></div>
            {schedule && <p className="pwd-classroom-schedule"><CalendarDays size={17} /><span>{schedule}<small>Vanuatu time · UTC+11</small></span></p>}
          </div>
          <div className="pwd-classroom-tips"><h3>Make yourself comfortable</h3><p><Headphones size={18} /><span>Use headphones for clearer sound.</span></p><p><Video size={18} /><span>Your camera is optional. Keep it off to save data.</span></p><p><Monitor size={18} /><span>Use Focus view for more room to follow demonstrations.</span></p></div>
          <div className="pwd-classroom-signoff"><span className="pwd-classroom-dot" /> Learning together, wherever you are.</div>
        </aside>
        <div className="pwd-classroom-meeting">
          {error && <div className="pwd-live-error" role="alert">{error} <a href={meetingUrl} target="_blank" rel="noopener noreferrer">Open in Zoom</a></div>}
          <iframe ref={frame} title="Zoom live classroom" src="/zoom-classroom/frame.html" allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write" allowFullScreen referrerPolicy="no-referrer" />
        </div>
      </div>
    </dialog>, document.body)}
  </section>;
}
