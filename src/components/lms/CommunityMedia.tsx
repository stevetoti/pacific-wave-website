"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Mic, Square } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { fileKind, type ChatFile } from "@/lib/lms/community";
// Shows an image, video or audio attachment from private storage using a short-lived link.
export function MediaView({
  file,
  courseId,
  channelId,
  banner = false,
  onDownload,
}: {
  file: ChatFile;
  courseId: string;
  channelId: string;
  banner?: boolean;
  onDownload: () => void;
}) {
  const kind = fileKind(file.mime);
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (kind === "file") return;
    let alive = true;
    authFetch(`/api/lms-community?${new URLSearchParams({ course: courseId, channel: channelId, file: file.id, view: "1" })}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (alive) setUrl(d.url);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [file.id, courseId, channelId, kind]);
  if (kind === "file" || failed)
    return (
      <button type="button" className="chat-file" onClick={onDownload}>
        <Download size={15} /> {file.name} <small>{Math.ceil(file.size / 1024)} KB</small>
      </button>
    );
  if (!url) return <div className={`cm-media-loading ${kind}`} aria-label={`Loading ${kind}`} />;
  if (kind === "image")
    return <img className={banner ? "cm-banner" : "cm-image"} src={url} alt={file.name} loading="lazy" />;
  if (kind === "video")
    return <video className="cm-video" src={url} controls preload="metadata" playsInline />;
  return (
    <div className="cm-audio">
      <audio src={url} controls preload="metadata" />
      <small>{file.name}</small>
    </div>
  );
}
export function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="cm-youtube">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
// Records a short voice note in the browser and hands back an audio file.
export function VoiceRecorder({ disabled, onRecorded }: { disabled: boolean; onRecorded: (file: File) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
    recorder.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);
  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
      const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = (rec.mimeType || "audio/webm").split(";")[0];
        const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
        onRecorded(new File(chunks, `Voice note ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.${ext}`, { type: mime }));
      };
      rec.start();
      recorder.current = rec;
      setRecording(true);
      setSeconds(0);
      const started = Date.now();
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setSeconds(elapsed);
        // Voice notes stop automatically after 5 minutes.
        if (elapsed >= 300) stop();
      }, 1000);
    } catch {
      setError("Microphone access was blocked. Allow the microphone in your browser to record.");
    }
  }
  function stop() {
    if (timer.current) clearInterval(timer.current);
    recorder.current?.state === "recording" && recorder.current.stop();
    setRecording(false);
  }
  return (
    <>
      <button type="button" className={`lms-text cm-record ${recording ? "on" : ""}`} disabled={disabled && !recording} onClick={recording ? stop : start}>
        {recording ? <Square size={16} /> : <Mic size={18} />}
        {recording ? `Stop recording ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Record voice"}
      </button>
      {error && <small className="cm-error">{error}</small>}
    </>
  );
}
