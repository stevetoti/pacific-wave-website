"use client";
import { useState } from "react";
import { CheckCircle2, Mail, MessageSquareText, Phone, Send, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { contactTemplates, fillTemplate, normalizePhone, smsParts, type ContactVars } from "@/lib/lms/contact-templates";
export type ContactRecipient = {
  user_id: string;
  order_id?: string;
  name: string;
  email: string;
  phone: string;
  vars: ContactVars;
};
type Channel = "email" | "sms" | "whatsapp";
type Result = { user_id: string; name: string; status: string; error: string };
// Send an email, SMS or WhatsApp message to one or many students from the Students tab.
export default function ContactDialog({
  recipients,
  smsEnabled,
  smsCredits,
  live,
  initialTemplate,
  onClose,
  onSent,
}: {
  recipients: ContactRecipient[];
  smsEnabled: boolean;
  smsCredits: number | null;
  live: boolean;
  initialTemplate: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [channel, setChannel] = useState<Channel>("email");
  const [templateId, setTemplateId] = useState(initialTemplate);
  const template = contactTemplates.find((t) => t.id === templateId) || contactTemplates[0];
  const [subject, setSubject] = useState(template.subject);
  const [message, setMessage] = useState(template.email);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [problem, setProblem] = useState("");
  const [opened, setOpened] = useState<string[]>([]);
  const pick = (id: string, ch: Channel = channel) => {
    const t = contactTemplates.find((x) => x.id === id) || contactTemplates[0];
    setTemplateId(t.id);
    setSubject(t.subject);
    setMessage(ch === "email" ? t.email : t.sms);
    setResults(null);
  };
  const switchChannel = (ch: Channel) => {
    setChannel(ch);
    pick(templateId, ch);
  };
  const reachable = recipients.filter((r) => (channel === "email" ? r.email : normalizePhone(r.phone)));
  const missing = recipients.length - reachable.length;
  const first = reachable[0] || recipients[0];
  const preview = first ? fillTemplate(message, first.vars) : message;
  const parts = smsParts(preview);
  async function send(targets: ContactRecipient[], ch: Channel) {
    const r = await authFetch("/api/lms-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: ch,
        template: templateId,
        subject,
        message,
        targets: targets.map((t) => ({ user_id: t.user_id, order_id: t.order_id || null })),
      }),
    });
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "Sending failed");
    return d as { results: Result[] };
  }
  async function sendAll() {
    if (!reachable.length) return;
    if (reachable.length > 1 && !confirm(`Send this ${channel === "email" ? "email" : "SMS"} to ${reachable.length} people?`)) return;
    setSending(true);
    setProblem("");
    try {
      const d = await send(reachable, channel);
      setResults(d.results);
      onSent();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Sending failed");
    } finally {
      setSending(false);
    }
  }
  const waLink = (r: ContactRecipient) =>
    `https://wa.me/${normalizePhone(r.phone).replace("+", "")}?text=${encodeURIComponent(fillTemplate(message, r.vars))}`;
  const openWhatsApp = (r: ContactRecipient) => {
    window.open(waLink(r), "_blank", "noopener");
    setOpened((o) => [...o, r.user_id]);
    send([r], "whatsapp").then(onSent).catch(() => {});
  };
  const statusText: Record<string, string> = { sent: "Sent", test_sent: "Sent to test inbox", failed: "Failed", skipped: "Not sent", opened: "Opened" };
  return (
    <div className="sr-modal" role="dialog" aria-modal="true" aria-labelledby="cd-title">
      <div className="sr-modal-card cd-card">
        <div className="cd-head">
          <h3 id="cd-title">
            <Send size={19} /> Contact {recipients.length === 1 ? recipients[0].name : `${recipients.length} students`}
          </h3>
          <button type="button" className="cd-close" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="cd-channels" role="tablist">
          {([["email", "Email", Mail], ["sms", "SMS", MessageSquareText], ["whatsapp", "WhatsApp", Phone]] as [Channel, string, typeof Mail][]).map(([key, label, Icon]) => (
            <button key={key} type="button" role="tab" aria-selected={channel === key} className={channel === key ? "selected" : ""} onClick={() => switchChannel(key)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        {channel === "sms" && !smsEnabled && (
          <p className="sr-warning">SMS isn&apos;t switched on yet. Add your VanuConnect API key to the website settings to start sending SMS. You can still use Email and WhatsApp.</p>
        )}
        {channel === "sms" && smsEnabled && smsCredits !== null && (
          <p className={smsCredits < parts * reachable.length ? "sr-warning" : "sr-help"}>
            VanuConnect SMS credits left: <strong>{smsCredits}</strong>. This send needs about {parts * reachable.length}.
            {smsCredits < parts * reachable.length && " Top up in VanuConnect first, or some messages won't be sent."}
          </p>
        )}
        {!live && channel !== "whatsapp" && (
          <p className="sr-help">Test mode: emails go to a test inbox and SMS are not sent.</p>
        )}
        <label>
          Message type
          <select value={templateId} onChange={(e) => pick(e.target.value)}>
            {contactTemplates.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        {channel === "email" && (
          <label>
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </label>
        )}
        <label>
          Message
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={channel === "email" ? 8 : 4} maxLength={3000} />
        </label>
        <p className="cd-vars">
          Personalised for each person: {"{first_name}"} {"{course}"} {"{amount}"} {"{reference}"} {"{link}"}
          {channel === "sms" && <> · <strong>{preview.length} characters = {parts} SMS credit{parts > 1 ? "s" : ""} each</strong></>}
        </p>
        {first && (
          <div className="cd-preview">
            <span>Preview for {first.name}</span>
            {channel === "email" && <strong>{fillTemplate(subject, first.vars)}</strong>}
            <p>{preview}</p>
            {channel === "email" && <small>Sent as a branded Pacific Wave Digital email with a button to {template.action.toLowerCase()}. Replies come to steve@pacificwavedigital.com.</small>}
          </div>
        )}
        {missing > 0 && (
          <p className="sr-warning">
            {missing} of {recipients.length} {missing === 1 ? "person has" : "people have"} no {channel === "email" ? "email address" : "valid phone number"} and will be skipped.
          </p>
        )}
        {problem && <p className="lms-alert" role="alert">{problem}</p>}
        {channel === "whatsapp" ? (
          <div className="cd-wa">
            <p className="sr-help">WhatsApp opens with the message ready on your phone or WhatsApp Web. Press send in WhatsApp.</p>
            {reachable.map((r) => (
              <div key={r.user_id + (r.order_id || "")} className="cd-wa-row">
                <span>{r.name} <small>{normalizePhone(r.phone)}</small></span>
                <button type="button" className={opened.includes(r.user_id) ? "cd-wa-done" : "cd-wa-open"} onClick={() => openWhatsApp(r)}>
                  {opened.includes(r.user_id) ? <><CheckCircle2 size={15} /> Opened</> : <><Phone size={15} /> Open WhatsApp</>}
                </button>
              </div>
            ))}
          </div>
        ) : results ? (
          <div className="cd-results">
            <p><strong>{results.filter((r) => r.status === "sent" || r.status === "test_sent").length} sent</strong>{results.some((r) => r.status === "failed") ? ` · ${results.filter((r) => r.status === "failed").length} failed` : ""}{results.some((r) => r.status === "skipped") ? ` · ${results.filter((r) => r.status === "skipped").length} not sent` : ""}</p>
            {results.filter((r) => r.status !== "sent").map((r) => (
              <small key={r.user_id}>{r.name}: {statusText[r.status] || r.status}{r.error ? ` — ${r.error}` : ""}</small>
            ))}
            <button type="button" className="lms-button" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className="sr-modal-actions">
            <button type="button" className="lms-text" onClick={onClose} disabled={sending}>Cancel</button>
            <button type="button" className="lms-button" disabled={sending || !reachable.length || (channel === "sms" && !smsEnabled)} onClick={sendAll}>
              <Send size={16} /> {sending ? "Sending…" : `Send ${channel === "email" ? "email" : "SMS"}${reachable.length > 1 ? ` to ${reachable.length}` : ""}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
