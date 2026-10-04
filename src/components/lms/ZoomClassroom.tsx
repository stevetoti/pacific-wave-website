"use client";
import { useEffect, useRef, useState } from "react";
import { Video, ExternalLink, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { zoomMeetingNumber, type ZoomJoin } from "@/lib/lms/zoom";
import "./zoom-classroom.css";

export default function ZoomClassroom({ lessonId, meetingUrl, title }: { lessonId: string; meetingUrl: string; title: string }) {
  const [state, setState] = useState<"idle" | "loading" | "open">("idle");
  const [error, setError] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  const join = useRef<ZoomJoin | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);
  const embeddable = Boolean(zoomMeetingNumber(meetingUrl));
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; join.current = null; }; }, []);
  useEffect(() => {
    if (state !== "open") return;
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
    return () => { document.body.style.overflow = original; window.removeEventListener("message", receive); };
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
  return <section className="pwd-live-card" aria-label="Live classroom">
    <div><strong><Video size={20} /> Live classroom</strong><p>Join your instructor and classmates. You can keep your camera off to save data.</p></div>
    <div className="pwd-live-actions">
      {embeddable && <button ref={trigger} className="lms-button" disabled={state === "loading"} onClick={connect}>{state === "loading" ? "Opening classroom…" : "Join inside dashboard"}</button>}
      <a className="lms-button secondary" href={meetingUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />{embeddable ? "Open in Zoom" : "Join live class"}</a>
    </div>
    {error && state !== "open" && <p role="alert">{error}</p>}
    {state === "open" && <div className="pwd-live-overlay" role="dialog" aria-modal="true" aria-label={title + " — Live classroom"}>
      <header><div><strong>{title}</strong><span>Pacific Wave Digital · Live classroom</span></div><button ref={closeButton} onClick={close} aria-label="Leave classroom and return to course"><X size={22} /> Return to course</button></header>
      {error && <div className="pwd-live-error" role="alert">{error} <a href={meetingUrl} target="_blank" rel="noopener noreferrer">Open in Zoom</a></div>}
      <iframe ref={frame} title="Zoom live classroom" src="/zoom-classroom/frame.html" allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write" allowFullScreen referrerPolicy="no-referrer" />
    </div>}
  </section>;
}
