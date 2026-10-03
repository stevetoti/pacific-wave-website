"use client";
import { useRef, useState } from "react";
import { CheckCircle2, Mail, MessageSquareText, Phone, Send, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { contactTemplates, fillTemplate, normalizePhone, smsParts, type ContactVars } from "@/lib/lms/contact-templates";
export type ContactChannel = "email" | "sms" | "whatsapp";
export type ContactRecipient = {
  user_id: string;
  order_id?: string;
  name: string;
  email: string;
  phone: string;
  vars: ContactVars;
};
type Channel = ContactChannel;
type Result = { user_id: string; name: string; status: string; error: string };
// Send an email, SMS or WhatsApp message to one or many students from the Students tab.
export default function ContactDialog({
  recipients,
  smsEnabled,
  smsCredits,
  live,
  initialTemplate,
  initialChannel = "email",
  onClose,
  onSent,
}: {
  recipients: ContactRecipient[];
  smsEnabled: boolean;
  smsCredits: number | null;
  live: boolean;
  initialTemplate: string;
  initialChannel?: Channel;
  onClose: () => void;
  onSent: (summary?: string) => void;
}) {
  const [channel, setChannel] = useState<Channel>(initialChannel);
  const [templateId, setTemplateId] = useState(initialTemplate);
  const template = contactTemplates.find((t) => t.id === templateId) || contactTemplates[0];
  const [subject, setSubject] = useState(template.subject);
  const [message, setMessage] = useState(initialChannel === "email" ? template.email : template.sms);
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
      const ok = d.results.filter((r) => r.status === "sent" || r.status === "test_sent");
      const what = channel === "email" ? "Email" : "SMS";
      const summary =
        ok.length === 1 && reachable.length === 1
          ? `${what} sent to ${ok[0].name}${ok[0].status === "test_sent" ? " (test inbox)" : ""}.`
          : `${what} sent to ${ok.length} of ${reachable.length} people.`;
      // All good: close and confirm with a pop-up. Otherwise stay open and show what failed.
      if (ok.length === d.results.length) {
        onSent(summary);
        onClose();
        return;
      }
      setResults(d.results);
      onSent(summary);
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
    send([r], "whatsapp").then(() => onSent(`WhatsApp opened for ${r.name}. Press send in WhatsApp.`)).catch(() => {});
  };
  const statusText: Record<string, string> = { sent: "Sent", test_sent: "Sent to test inbox", failed: "Failed", skipped: "Not sent", opened: "Opened" };
  const box = useRef<HTMLTextAreaElement>(null);
  // Insert a personalisation tag where the cursor is.
  const insertTag = (tag: string) => {
    const el = box.current;
    const at = el ? el.selectionStart : message.length;
    const end = el ? el.selectionEnd : message.length;
    const next = message.slice(0, at) + tag + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + tag.length, at + tag.length);
    });
  };
  const channels: [Channel, string, typeof Mail][] = [["email", "Email", Mail], ["sms", "SMS", MessageSquareText], ["whatsapp", "WhatsApp", Phone]];
  const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";
  const needed = parts * reachable.length;
  const lowCredit = channel === "sms" && smsEnabled && smsCredits !== null && smsCredits < needed;
  const canSend = !sending && reachable.length > 0 && !(channel === "sms" && !smsEnabled) && !(channel === "email" && subject.trim().length < 2);
  return (
    <div className="sr-modal cd-overlay" role="dialog" aria-modal="true" aria-labelledby="cd-title" onClick={(e) => e.target === e.currentTarget && !sending && onClose()}>
      <div className={`sr-modal-card cd-card cd-${channel}`}>
        <header className="cd-head">
          <div className="cd-who">
            <div className="cd-avatars" aria-hidden="true">
              {recipients.slice(0, 3).map((r) => <span key={r.user_id + (r.order_id || "")}>{initials(r.name)}</span>)}
              {recipients.length > 3 && <span className="more">+{recipients.length - 3}</span>}
            </div>
            <div>
              <h3 id="cd-title">{recipients.length === 1 ? recipients[0].name : `${recipients.length} students`}</h3>
              <p>
                {recipients.length === 1
                  ? channel === "email" ? recipients[0].email || "No email address" : normalizePhone(recipients[0].phone) || "No valid phone number"
                  : `${reachable.length} reachable by ${channel === "email" ? "email" : channel === "sms" ? "SMS" : "WhatsApp"}`}
              </p>
            </div>
          </div>
          <button type="button" className="cd-close" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </header>
        <div className="cd-body">
          <section className="cd-compose">
            <div className="cd-channels" role="tablist" aria-label="Send by">
              {channels.map(([key, label, Icon]) => (
                <button key={key} type="button" role="tab" aria-selected={channel === key} className={`${key} ${channel === key ? "selected" : ""}`} onClick={() => switchChannel(key)}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
            {!live && channel !== "whatsapp" && <p className="cd-note test">Test mode: emails go to a test inbox and SMS are not sent.</p>}
            {channel === "sms" && !smsEnabled && (
              <p className="cd-note warn">SMS isn&apos;t switched on yet. Add your VanuConnect API key to the website settings. You can still use Email and WhatsApp.</p>
            )}
            <div className="cd-field">
              <span className="cd-label">Message type</span>
              <div className="cd-templates" role="radiogroup" aria-label="Message type">
                {contactTemplates.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={templateId === t.id} className={templateId === t.id ? "selected" : ""} onClick={() => pick(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {channel === "email" && (
              <label className="cd-field">
                <span className="cd-label">Subject</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Subject line" />
              </label>
            )}
            <label className="cd-field">
              <span className="cd-label">
                Message
                {channel === "sms" && (
                  <em className={parts > 1 ? "cd-count multi" : "cd-count"}>{preview.length} chars · {parts} credit{parts > 1 ? "s" : ""}{reachable.length > 1 ? " each" : ""}</em>
                )}
              </span>
              <textarea ref={box} value={message} onChange={(e) => setMessage(e.target.value)} rows={channel === "email" ? 8 : 5} maxLength={3000} />
            </label>
            <div className="cd-tags" aria-label="Insert personal details">
              <span>Insert:</span>
              {([["{first_name}", "First name"], ["{course}", "Course"], ["{amount}", "Amount"], ["{reference}", "Reference"], ["{link}", "Link"]] as [string, string][]).map(([tag, label]) => (
                <button key={tag} type="button" onClick={() => insertTag(tag)}>{label}</button>
              ))}
            </div>
            {channel === "sms" && parts > 1 && <p className="cd-note">Tip: keep SMS under 160 characters to use 1 credit and arrive faster.</p>}
            {missing > 0 && (
              <p className="cd-note warn">
                {missing} of {recipients.length} {missing === 1 ? "person has" : "people have"} no {channel === "email" ? "email address" : "valid phone number"} and will be skipped.
              </p>
            )}
          </section>
          <aside className="cd-side" aria-label="Preview">
            <span className="cd-side-label">Preview{first ? ` for ${first.name.split(/\s+/)[0]}` : ""}</span>
            {channel === "email" ? (
              <div className="cd-preview cd-mail">
                <div className="cd-mail-top"><span>PACIFIC WAVE DIGITAL</span><small>Training Centre</small></div>
                <div className="cd-mail-body">
                  <strong>{first ? fillTemplate(subject, first.vars) : subject}</strong>
                  <p>{preview}</p>
                  <span className="cd-mail-btn">{template.action}</span>
                </div>
                <small>Replies come to steve@pacificwavedigital.com</small>
              </div>
            ) : (
              <div className={`cd-preview cd-phone ${channel}`}>
                <div className="cd-phone-top">
                  <span className="cd-phone-avatar">{channel === "whatsapp" ? <Phone size={14} /> : "PWD"}</span>
                  <div><strong>{channel === "whatsapp" ? "You" : "Pacific Wave"}</strong><small>{channel === "whatsapp" ? "WhatsApp" : "Text message"}</small></div>
                </div>
                <div className="cd-phone-screen">
                  <p className="cd-bubble">{preview}</p>
                </div>
              </div>
            )}
            {channel === "sms" && smsEnabled && smsCredits !== null && (
              <div className={`cd-credits ${lowCredit ? "low" : ""}`}>
                <div><span>SMS credits</span><strong>{smsCredits}</strong></div>
                <div><span>This send</span><strong>{needed}</strong></div>
                {lowCredit && <small>Top up in VanuConnect first, or some messages won&apos;t be sent.</small>}
              </div>
            )}
          </aside>
        </div>
        {problem && <p className="lms-alert cd-problem" role="alert">{problem}</p>}
        {channel === "whatsapp" ? (
          <footer className="cd-foot cd-wa">
            <p className="cd-note">WhatsApp opens with the message ready. Press send in WhatsApp.</p>
            {reachable.map((r) => (
              <div key={r.user_id + (r.order_id || "")} className="cd-wa-row">
                <span>{r.name} <small>{normalizePhone(r.phone)}</small></span>
                <button type="button" className={opened.includes(r.user_id) ? "cd-wa-done" : "cd-wa-open"} onClick={() => openWhatsApp(r)}>
                  {opened.includes(r.user_id) ? <><CheckCircle2 size={15} /> Opened</> : <><Phone size={15} /> Open WhatsApp</>}
                </button>
              </div>
            ))}
          </footer>
        ) : results ? (
          <footer className="cd-foot cd-results">
            <p><strong>{results.filter((r) => r.status === "sent" || r.status === "test_sent").length} sent</strong>{results.some((r) => r.status === "failed") ? ` · ${results.filter((r) => r.status === "failed").length} failed` : ""}{results.some((r) => r.status === "skipped") ? ` · ${results.filter((r) => r.status === "skipped").length} not sent` : ""}</p>
            {results.filter((r) => r.status !== "sent").map((r) => (
              <small key={r.user_id}>{r.name}: {statusText[r.status] || r.status}{r.error ? ` — ${r.error}` : ""}</small>
            ))}
            <button type="button" className="lms-button" onClick={onClose}>Done</button>
          </footer>
        ) : (
          <footer className="cd-foot sr-modal-actions">
            <button type="button" className="lms-text" onClick={onClose} disabled={sending}>Cancel</button>
            <button type="button" className="lms-button cd-send" disabled={!canSend} onClick={sendAll}>
              <Send size={16} /> {sending ? "Sending…" : `Send ${channel === "email" ? "email" : "SMS"}${reachable.length > 1 ? ` to ${reachable.length}` : ""}`}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
