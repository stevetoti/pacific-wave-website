"use client";
import { useCallback, useEffect, useState } from "react";
import { Mail, MessageSquareText, Phone, Search, StickyNote } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import StudentProfile, { statusText, when } from "./StudentProfile";
type Entry = { id: string; user_id: string; student: string; kind: string; title: string; body: string; status: string; error: string; recipient: string; by: string; created_at: string };
const icons: Record<string, typeof Mail> = { email: Mail, sms: MessageSquareText, whatsapp: Phone, note: StickyNote };
// Mini CRM log: every email, SMS, WhatsApp and note sent from the Students tab.
export default function ContactHistory() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [channel, setChannel] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [config, setConfig] = useState({ sms_enabled: false, sms_credits: null as number | null, live: false });
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await authFetch(`/api/lms-contact?log=1${channel ? `&channel=${channel}` : ""}`);
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "Could not load history");
    setEntries(d.entries);
  }, [channel]);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  useEffect(() => {
    authFetch("/api/lms-contact").then(async (r) => r.ok && setConfig(await r.json())).catch(() => {});
  }, []);
  const q = search.trim().toLowerCase();
  const shown = (entries || []).filter((e) => !q || [e.student, e.recipient, e.title, e.body, e.by].join(" ").toLowerCase().includes(q));
  const count = (k: string) => (entries || []).filter((e) => e.kind === k).length;
  return (
    <section className="lms-panel sr-list">
      <h2>Contact history</h2>
      <p className="sr-help">Every email, SMS, WhatsApp message and private note sent to students from the Students tab. Click a row to open the student&apos;s full history.</p>
      {error && <p className="lms-alert" role="alert">{error}</p>}
      <div className="sr-toolbar">
        <label className="sr-search">
          <Search size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student, message or sender" aria-label="Search history" />
        </label>
      </div>
      <div className="sr-chips">
        {([["", "All"], ["email", "Emails"], ["sms", "SMS"], ["whatsapp", "WhatsApp"], ["note", "Notes"]] as [string, string][]).map(([k, l]) => (
          <button key={k || "all"} type="button" className={channel === k ? "selected" : ""} onClick={() => setChannel(k)}>
            {l}{!channel && k ? <span>{count(k)}</span> : null}
          </button>
        ))}
      </div>
      {!entries ? (
        <p>Loading history…</p>
      ) : shown.length ? (
        <div className="sr-table">
          {shown.map((e) => {
            const Icon = icons[e.kind] || Mail;
            return (
              <button key={e.id} type="button" className={`sr-row ch-row ${e.status === "failed" ? "failed" : ""}`} onClick={() => setOpen(e.user_id)}>
                <span className={`sp-icon ${e.kind}`}><Icon size={16} /></span>
                <span className="sr-person">
                  <strong>{e.student}</strong>
                  <small>{e.recipient}</small>
                </span>
                <span className="ch-message">
                  <strong>{e.title}</strong>
                  <small>{e.body.slice(0, 140)}{e.body.length > 140 ? "…" : ""}</small>
                  {e.error && <small className="sp-error">{e.error}</small>}
                </span>
                <span className="ch-meta">
                  <span className={`sp-badge ${e.status}`}>{statusText[e.status] || e.status}</span>
                  <small>{when(e.created_at)}</small>
                  <small>by {e.by}</small>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="sr-empty">Nothing sent yet. Use Contact on the Students tab to email, text or WhatsApp a student.</p>
      )}
      {open && (
        <StudentProfile
          userId={open}
          smsEnabled={config.sms_enabled}
          smsCredits={config.sms_credits}
          live={config.live}
          onClose={() => setOpen(null)}
          onChanged={() => load().catch(() => {})}
        />
      )}
    </section>
  );
}
