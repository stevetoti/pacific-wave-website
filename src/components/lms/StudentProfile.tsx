"use client";
import { useCallback, useEffect, useState } from "react";
import { Bot, Mail, MessageSquareText, Phone, StickyNote, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import ContactDialog, { type ContactChannel, type ContactRecipient } from "./ContactDialog";
type Registration = { id: string; course: string; status: string; amount: string | null; reference: string; created_at: string };
type Student = { user_id: string; name: string; email: string; phone: string; city: string; work: string; joined: string | null; last_sign_in: string | null; registrations: Registration[] };
type Entry = { id: string; kind: string; title: string; body: string; status: string; error: string; recipient: string; by: string; automatic: boolean; created_at: string };
const icons: Record<string, typeof Mail> = { email: Mail, sms: MessageSquareText, whatsapp: Phone, note: StickyNote };
export const statusText: Record<string, string> = {
  sent: "Sent", test_sent: "Sent (test inbox)", failed: "Failed", skipped: "Not sent", opened: "Opened in WhatsApp", saved: "Note",
  accepted: "Delivered to email provider", test_accepted: "Sent (test inbox)", delivered: "Delivered", pending: "Queued",
};
const regStatus: Record<string, string> = { paid: "Enrolled (paid)", granted: "Enrolled (access given)", review: "Proof to check", pending: "Not paid yet", rejected: "Proof rejected", refunded: "Refunded", revoked: "Access removed" };
export const when = (iso: string) => new Date(iso).toLocaleString([], { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
// Mini CRM: one student's details, registrations, contact actions, notes and full contact timeline.
export default function StudentProfile({
  userId,
  smsEnabled,
  smsCredits,
  live,
  onClose,
  onChanged,
}: {
  userId: string;
  smsEnabled: boolean;
  smsCredits: number | null;
  live: boolean;
  onClose: () => void;
  onChanged: (message?: string) => void;
}) {
  const [student, setStudent] = useState<Student | null>(null);
  const [timeline, setTimeline] = useState<Entry[]>([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [contact, setContact] = useState<{ template: string; channel: ContactChannel } | null>(null);
  const load = useCallback(async () => {
    const r = await authFetch(`/api/lms-contact?history=${userId}`);
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "Could not load this student");
    setStudent(d.student);
    setTimeline(d.timeline);
  }, [userId]);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  async function saveNote() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const r = await authFetch("/api/lms-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "note", user_id: userId, body: note.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Could not save note");
      setNote("");
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save note");
    } finally {
      setSaving(false);
    }
  }
  const reg = student?.registrations[0];
  const recipient: ContactRecipient | null = student
    ? {
        user_id: student.user_id,
        order_id: reg?.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        vars: {
          first_name: student.name.split(/\s+/)[0] || "there",
          course: reg?.course || "our training",
          amount: reg?.amount || "",
          reference: reg?.reference || "",
          link: `${typeof window === "undefined" ? "pacificwavedigital.com" : window.location.host}/training-center/${reg && ["pending", "rejected"].includes(reg.status) ? "checkout" : "dashboard"}`,
        },
      }
    : null;
  const shown = timeline.filter((e) => filter === "all" || (filter === "auto" ? e.automatic : !e.automatic && e.kind === filter));
  return (
    <div className="sr-modal sp-overlay" role="dialog" aria-modal="true" aria-labelledby="sp-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="sp-panel">
        <header className="sp-head">
          {student && <span className="sp-avatar" aria-hidden="true">{student.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")}</span>}
          <div className="sp-head-text">
            <h3 id="sp-title">{student?.name || "Loading…"}</h3>
            {student && (
              <p>
                {student.email}
                {student.phone && ` · ${student.phone}`}
                {student.city && ` · ${student.city}`}
              </p>
            )}
            {student?.work && <p>{student.work}</p>}
          </div>
          <button type="button" className="cd-close" aria-label="Close" onClick={onClose}><X size={22} /></button>
        </header>
        {error && <p className="lms-alert" role="alert">{error}</p>}
        {!student && !error && (
          <div className="sp-skeleton" aria-label="Loading student">
            <span /><span /><span className="tall" /><span className="tall" />
          </div>
        )}
        {student && (
          <>
            <div className="sp-actions">
              {([["email", "Email", Mail], ["sms", "SMS", MessageSquareText], ["whatsapp", "WhatsApp", Phone]] as [ContactChannel, string, typeof Mail][]).map(([ch, label, Icon]) => (
                <button key={ch} type="button" onClick={() => setContact({ channel: ch, template: reg && ["pending", "rejected"].includes(reg.status) ? "payment_reminder" : "custom" })}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
            <section className="sp-section">
              <h4>Registrations</h4>
              {student.registrations.length ? (
                student.registrations.map((r) => (
                  <div key={r.id} className="sp-reg">
                    <strong>{r.course}</strong>
                    <span className={`sr-status ${["paid", "granted"].includes(r.status) ? "ok" : r.status === "review" ? "warn" : r.status === "rejected" ? "bad" : "muted"}`}>{regStatus[r.status] || r.status}</span>
                    <small>{r.amount ? `${r.amount} · ` : ""}Ref {r.reference} · registered {new Date(r.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              ) : (
                <p className="sr-help">No course registrations yet.</p>
              )}
              <small className="sr-help">
                Account created {student.joined ? new Date(student.joined).toLocaleDateString() : "—"} · {student.last_sign_in ? `last signed in ${new Date(student.last_sign_in).toLocaleDateString()}` : "never signed in"}
              </small>
            </section>
            <section className="sp-section">
              <h4>Add a private note</h4>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={2} placeholder="e.g. Called on Monday, will pay by Friday. Only staff can see notes." />
              <button type="button" className="lms-button" disabled={saving || !note.trim()} onClick={saveNote}>{saving ? "Saving…" : "Save note"}</button>
            </section>
            <section className="sp-section">
              <h4>Contact history</h4>
              <div className="sr-chips">
                {([["all", "All"], ["email", "Emails"], ["sms", "SMS"], ["whatsapp", "WhatsApp"], ["note", "Notes"], ["auto", "Automatic emails"]] as [string, string][]).map(([k, l]) => (
                  <button key={k} type="button" className={filter === k ? "selected" : ""} onClick={() => setFilter(k)}>{l}</button>
                ))}
              </div>
              <ol className="sp-timeline">
                {shown.map((e) => {
                  const Icon = e.automatic ? Bot : icons[e.kind] || Mail;
                  return (
                    <li key={e.id} className={`sp-entry ${e.kind} ${e.automatic ? "auto" : ""} ${e.status === "failed" ? "failed" : ""}`}>
                      <span className="sp-icon"><Icon size={16} /></span>
                      <div>
                        <div className="sp-entry-head">
                          <strong>{e.title}</strong>
                          <span className={`sp-badge ${e.status}`}>{statusText[e.status] || e.status}</span>
                        </div>
                        <small>{when(e.created_at)} · {e.automatic ? "Sent automatically" : `${e.kind === "note" ? "Written" : "Sent"} by ${e.by}`}{e.recipient && e.kind !== "note" ? ` · to ${e.recipient}` : ""}</small>
                        {e.error && <small className="sp-error">{e.error}</small>}
                        {e.body && (
                          <details>
                            <summary>{e.kind === "note" ? e.body.slice(0, 120) : "Show message"}</summary>
                            <p>{e.body}</p>
                          </details>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {!shown.length && <p className="sr-help">Nothing here yet.</p>}
            </section>
          </>
        )}
      </aside>
      {contact && recipient && (
        <ContactDialog
          recipients={[recipient]}
          smsEnabled={smsEnabled}
          smsCredits={smsCredits}
          live={live}
          initialTemplate={contact.template}
          initialChannel={contact.channel}
          onClose={() => setContact(null)}
          onSent={(summary) => {
            load().catch(() => {});
            onChanged(summary);
          }}
        />
      )}
    </div>
  );
}
