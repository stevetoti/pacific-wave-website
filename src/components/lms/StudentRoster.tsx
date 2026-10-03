"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BellRing, CheckCircle2, Clock3, FileText, History, MessageCircle, Search, Send, Trash2, UserPlus, XCircle } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import ContactDialog, { type ContactRecipient } from "./ContactDialog";
import StudentProfile from "./StudentProfile";
import { money, paymentReference, type Course, type Order } from "@/lib/lms/types";
type Account = { user_id: string; email: string; name: string; phone: string; city: string; created_at: string; last_sign_in_at: string | null; role: string };
type Group = "all" | "enrolled" | "review" | "unpaid" | "other";
type DeleteTarget = { name: string; email: string; userId: string; order?: Order };
// Plain-English status for each registration.
const statusInfo: Record<string, { label: string; group: Group; tone: string }> = {
  paid: { label: "Enrolled (paid)", group: "enrolled", tone: "ok" },
  granted: { label: "Enrolled (access given)", group: "enrolled", tone: "ok" },
  review: { label: "Proof to check", group: "review", tone: "warn" },
  pending: { label: "Not paid yet", group: "unpaid", tone: "muted" },
  rejected: { label: "Proof rejected", group: "unpaid", tone: "bad" },
  refunded: { label: "Refunded", group: "other", tone: "muted" },
  revoked: { label: "Access removed", group: "other", tone: "muted" },
};
const ago = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days < 1 ? "Today" : days === 1 ? "Yesterday" : days < 30 ? `${days} days ago` : new Date(iso).toLocaleDateString();
};
export default function StudentRoster({
  orders,
  courses,
  busy,
  save,
  onChanged,
  mode = "admin",
}: {
  mode?: "admin" | "teach";
  orders: Order[];
  courses: Course[];
  busy: boolean;
  save: (body: unknown) => Promise<void>;
  onChanged: () => Promise<void>;
}) {
  const admin = mode === "admin";
  const [profile, setProfile] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; userId?: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 9000);
    return () => clearTimeout(t);
  }, [toast]);
  const sent = (summary: string | undefined, userId?: string) => {
    if (summary) setToast({ text: summary, userId });
    loadOutreach();
  };
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [scope, setScope] = useState<"registration" | "account">("registration");
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [contact, setContact] = useState<{ recipients: ContactRecipient[]; template: string } | null>(null);
  const [outreach, setOutreach] = useState<{ sms_enabled: boolean; sms_credits: number | null; live: boolean; latest: Record<string, { channel: string; created_at: string; template: string }> }>({ sms_enabled: false, sms_credits: null, live: false, latest: {} });
  const loadOutreach = () =>
    authFetch("/api/lms-contact")
      .then(async (r) => r.ok && setOutreach(await r.json()))
      .catch(() => {});
  useEffect(() => {
    loadOutreach();
  }, []);
  const origin = typeof window === "undefined" ? "pacificwavedigital.com" : window.location.host;
  // Message details for one registration (or an account with no course).
  const fromOrder = (o: Order): ContactRecipient => {
    const c = courses.find((x) => x.id === o.course_id);
    return {
      user_id: o.user_id,
      order_id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      vars: {
        first_name: o.name.trim().split(/\s+/)[0] || "there",
        course: c?.title || "our training",
        amount: admin ? money(o.amount, o.currency) : "",
        reference: paymentReference(o.id),
        link: ["pending", "rejected"].includes(o.status) && c ? `${origin}/training-center/checkout?course=${c.slug}` : `${origin}/training-center/dashboard`,
      },
    };
  };
  const fromAccount = (a: Account): ContactRecipient => ({
    user_id: a.user_id,
    name: a.name || a.email,
    email: a.email,
    phone: a.phone,
    vars: { first_name: (a.name || "there").split(/\s+/)[0], course: "our training", amount: "", reference: "", link: `${origin}/training-center` },
  });
  const lastContact = (userId: string) => {
    const l = outreach.latest[userId];
    if (!l) return null;
    const label = { email: "Emailed", sms: "SMS sent", whatsapp: "WhatsApp opened" }[l.channel] || "Contacted";
    return `${label} ${ago(l.created_at).toLowerCase()}`;
  };
  const [course, setCourse] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const loadAccounts = () =>
    authFetch("/api/lms-students")
      .then(async (r) => (r.ok ? setAccounts((await r.json()).accounts) : setAccounts([])))
      .catch(() => setAccounts([]));
  useEffect(() => {
    if (admin) loadAccounts();
  }, [admin]);
  const askDelete = (t: DeleteTarget) => {
    setTarget(t);
    setScope(t.order ? "registration" : "account");
    setTyped("");
    setProblem("");
  };
  async function confirmDelete() {
    if (!target || typed.trim().toUpperCase() !== "DELETE") return;
    setDeleting(true);
    setProblem("");
    try {
      const r = await authFetch("/api/lms-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          scope === "registration" && target.order
            ? { action: "delete_registration", order_id: target.order.id }
            : { action: "delete_student", user_id: target.userId },
        ),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Delete failed");
      setNotice(
        scope === "registration"
          ? `Deleted ${target.name}'s registration for ${title(target.order!.course_id)}.`
          : `Deleted ${target.name}'s account and everything linked to it.`,
      );
      setTarget(null);
      await Promise.all([onChanged(), loadAccounts()]);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }
  const title = (id: string) => courses.find((c) => c.id === id)?.title || "Course";
  const counts = (list: Order[]) => ({
    enrolled: list.filter((o) => statusInfo[o.status]?.group === "enrolled").length,
    review: list.filter((o) => o.status === "review").length,
    unpaid: list.filter((o) => statusInfo[o.status]?.group === "unpaid").length,
  });
  const toReview = orders.filter((o) => o.status === "review");
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => !course || o.course_id === course)
      .filter((o) => group === "all" || statusInfo[o.status]?.group === group)
      .filter((o) => !q || [o.name, o.email, o.phone, paymentReference(o.id)].join(" ").toLowerCase().includes(q))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [orders, course, group, search]);
  const filteredAccounts = (accounts || []).filter((a) => {
    const q = search.trim().toLowerCase();
    return !q || [a.name, a.email, a.phone].join(" ").toLowerCase().includes(q);
  });
  const review = (o: Order, approve: boolean) => {
    const note = approve ? "" : prompt(`Tell ${o.name} what needs fixing (they see this note):`, "We couldn't match your transfer. Please upload a clearer receipt showing the amount and reference.");
    if (!approve && note === null) return;
    if (approve && !confirm(`Approve ${o.name}'s payment of ${money(o.amount, o.currency)}? Check the deposit in your bank first.`)) return;
    save({ action: "review", id: o.id, status: approve ? "paid" : "rejected", note: note || "" });
  };
  const otherRegs = target ? orders.filter((o) => o.user_id === target.userId) : [];
  return (
    <div className="sr">
      {notice && <p className="lms-notice" role="status">{notice}</p>}
      {contact && (
        <ContactDialog
          recipients={contact.recipients}
          smsEnabled={outreach.sms_enabled}
          smsCredits={outreach.sms_credits}
          live={outreach.live}
          initialTemplate={contact.template}
          onClose={() => setContact(null)}
          onSent={(summary) => {
            sent(summary, contact.recipients.length === 1 ? contact.recipients[0].user_id : undefined);
            setSelected([]);
          }}
        />
      )}
      {profile && (
        <StudentProfile
          userId={profile}
          smsEnabled={outreach.sms_enabled}
          smsCredits={outreach.sms_credits}
          live={outreach.live}
          onClose={() => setProfile(null)}
          onChanged={(summary) => sent(summary)}
        />
      )}
      {toast && (
        <div className="sr-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          <span>{toast.text}</span>
          {toast.userId && (
            <button type="button" onClick={() => { setProfile(toast.userId!); setToast(null); }}>View history</button>
          )}
          <button type="button" className="sr-toast-close" aria-label="Dismiss" onClick={() => setToast(null)}><XCircle size={16} /></button>
        </div>
      )}
      {target && (
        <div className="sr-modal" role="dialog" aria-modal="true" aria-labelledby="sr-delete-title">
          <div className="sr-modal-card">
            <h3 id="sr-delete-title"><Trash2 size={20} /> Delete {target.name}?</h3>
            <p className="sr-help">{target.email}</p>
            {target.order && (
              <label className={`sr-choice ${scope === "registration" ? "selected" : ""}`}>
                <input type="radio" name="scope" checked={scope === "registration"} onChange={() => setScope("registration")} />
                <span>
                  <strong>Remove this registration only</strong>
                  <small>{title(target.order.course_id)} · {statusInfo[target.order.status]?.label || target.order.status}. Removes the payment proof, progress and quiz results for this course. Their account stays.</small>
                </span>
              </label>
            )}
            <label className={`sr-choice ${scope === "account" ? "selected" : ""}`}>
              <input type="radio" name="scope" checked={scope === "account"} onChange={() => setScope("account")} />
              <span>
                <strong>Delete the whole account</strong>
                <small>
                  Removes their login, profile, {otherRegs.length || "no"} registration{otherRegs.length === 1 ? "" : "s"}, messages, connections, notifications and uploaded files. They would need to sign up again.
                </small>
              </span>
            </label>
            {target.order && ["paid", "granted"].includes(target.order.status) && (
              <p className="sr-warning">This student is enrolled{target.order.status === "paid" && target.order.amount > 0 ? ` and paid ${money(target.order.amount, target.order.currency)}` : ""}. Deleting does not refund any money.</p>
            )}
            <label className="sr-type">
              This cannot be undone. Type <strong>DELETE</strong> to confirm.
              <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus aria-label="Type DELETE to confirm" />
            </label>
            {problem && <p className="lms-alert" role="alert">{problem}</p>}
            <div className="sr-modal-actions">
              <button type="button" className="lms-text" onClick={() => setTarget(null)} disabled={deleting}>Cancel</button>
              <button type="button" className="sr-delete-confirm" disabled={deleting || typed.trim().toUpperCase() !== "DELETE"} onClick={confirmDelete}>
                <Trash2 size={16} /> {deleting ? "Deleting…" : scope === "registration" ? "Delete registration" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="sr-courses">
        {courses.map((c) => {
          const n = counts(orders.filter((o) => o.course_id === c.id));
          return (
            <article key={c.id} className={`sr-course ${course === c.id ? "selected" : ""}`}>
              <button type="button" className="sr-course-title" onClick={() => { setCourse(course === c.id ? "" : c.id); setGroup("all"); }}>
                <strong>{c.title}</strong>
                <small>{c.published ? "Published" : "Not public"}</small>
              </button>
              <div className="sr-course-stats">
                <button type="button" onClick={() => { setCourse(c.id); setGroup("enrolled"); }}><b>{n.enrolled}</b> enrolled</button>
                <button type="button" className={n.review ? "warn" : ""} onClick={() => { setCourse(c.id); setGroup("review"); }}><b>{n.review}</b> to check</button>
                <button type="button" onClick={() => { setCourse(c.id); setGroup("unpaid"); }}><b>{n.unpaid}</b> not paid</button>
              </div>
            </article>
          );
        })}
      </section>
      {admin && toReview.length > 0 && (
        <section className="sr-attention">
          <h3><AlertCircle size={20} /> Needs your attention: {toReview.length} payment {toReview.length === 1 ? "proof" : "proofs"} to check</h3>
          {toReview.map((o) => (
            <div key={o.id} className="sr-attention-row">
              <div>
                <strong>{o.name}</strong> · {o.email}
                <small>{title(o.course_id)} · {money(o.amount, o.currency)} · {o.bank || "Bank"} · Ref {paymentReference(o.id)} · {ago(o.created_at)}</small>
              </div>
              <div className="sr-actions">
                {o.proof_path && (
                  <button type="button" className="lms-text" disabled={busy} onClick={() => save({ action: "proof", id: o.id })}>
                    <FileText size={15} /> View proof
                  </button>
                )}
                <button type="button" className="sr-approve" disabled={busy} onClick={() => review(o, true)}>
                  <CheckCircle2 size={15} /> Approve
                </button>
                <button type="button" className="sr-reject" disabled={busy} onClick={() => review(o, false)}>
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="lms-panel sr-list">
        <div className="sr-toolbar">
          <label className="sr-search">
            <Search size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone or PWD- reference" aria-label="Search students" />
          </label>
          <select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course">
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="sr-chips" role="tablist" aria-label="Status">
          {([["all", "All"], ["enrolled", "Enrolled"], ["review", "Proof to check"], ["unpaid", "Not paid yet"], ["other", "Refunded / removed"]] as [Group, string][]).map(([g, label]) => (
            <button key={g} type="button" role="tab" aria-selected={group === g} className={group === g ? "selected" : ""} onClick={() => setGroup(g)}>
              {label} <span>{orders.filter((o) => (!course || o.course_id === course) && (g === "all" || statusInfo[o.status]?.group === g)).length}</span>
            </button>
          ))}
        </div>
        <div className="sr-bulk">
          <label className="sr-check">
            <input
              type="checkbox"
              checked={rows.length > 0 && rows.every((o) => selected.includes(o.id))}
              onChange={(e) => setSelected(e.target.checked ? rows.map((o) => o.id) : [])}
            />
            Select all shown
          </label>
          {selected.length > 0 && (
            <button type="button" className="lms-button sr-bulk-send" onClick={() => setContact({ recipients: orders.filter((o) => selected.includes(o.id)).map(fromOrder), template: "custom" })}>
              <Send size={15} /> Contact {selected.length} selected
            </button>
          )}
          {admin && orders.filter((o) => (!course || o.course_id === course) && ["pending", "rejected"].includes(o.status)).length > 0 && (
            <button type="button" className="sr-remind" onClick={() => setContact({ recipients: orders.filter((o) => (!course || o.course_id === course) && ["pending", "rejected"].includes(o.status)).map(fromOrder), template: "payment_reminder" })}>
              <BellRing size={15} /> Remind everyone who hasn&apos;t paid ({orders.filter((o) => (!course || o.course_id === course) && ["pending", "rejected"].includes(o.status)).length})
            </button>
          )}
        </div>
        <div className="sr-table">
          {rows.map((o) => {
            const s = statusInfo[o.status] || { label: o.status, tone: "muted" };
            return (
              <article key={o.id} className={`sr-row ${selected.includes(o.id) ? "picked" : ""}`}>
                <div className="sr-person">
                  <label className="sr-check sr-row-check" aria-label={`Select ${o.name}`}>
                    <input type="checkbox" checked={selected.includes(o.id)} onChange={(e) => setSelected((x) => (e.target.checked ? [...x, o.id] : x.filter((i) => i !== o.id)))} />
                  </label>
                  <button type="button" className="sr-name" onClick={() => setProfile(o.user_id)} title="Open contact history">{o.name}</button>
                  <small>{o.email}</small>
                  <small>{o.phone}</small>
                  {lastContact(o.user_id) && <small className="sr-last"><Send size={11} /> {lastContact(o.user_id)}</small>}
                </div>
                <div className="sr-course-cell">
                  <span>{title(o.course_id)}</span>
                  <small>{o.attendance.replace("_", " ")} · registered {ago(o.created_at)}</small>
                </div>
                <div className="sr-status-cell">
                  <span className={`sr-status ${s.tone}`}>
                    {s.tone === "ok" ? <CheckCircle2 size={14} /> : s.tone === "warn" ? <Clock3 size={14} /> : null}
                    {s.label}
                  </span>
                  {admin && <small>
                    {money(o.amount, o.currency)}
                    {o.coupon_code ? ` · coupon ${o.coupon_code}` : ""}
                    {o.method ? ` · ${o.method === "bank" ? `bank${o.bank ? ` (${o.bank})` : ""}` : o.method}` : ""}
                  </small>}
                  {admin && <small>Ref {paymentReference(o.id)}</small>}
                </div>
                <div className="sr-actions">
                  <a href={`/training-center/dashboard?tab=messages&with=${o.user_id}`} target="_blank" rel="noreferrer" title="Message in the Training Centre"><MessageCircle size={16} /><span>Message</span></a>
                  <button type="button" className="lms-text sr-history" onClick={() => setProfile(o.user_id)}><History size={15} /><span>History</span></button>
                  <button type="button" className="sr-contact" onClick={() => setContact({ recipients: [fromOrder(o)], template: ["pending", "rejected"].includes(o.status) ? "payment_reminder" : statusInfo[o.status]?.group === "enrolled" ? "enrolled_next_steps" : "custom" })}>
                    <Send size={15} /> Contact
                  </button>
                  {admin && o.status === "review" && (
                    <>
                      <button type="button" className="sr-approve" disabled={busy} onClick={() => review(o, true)}><CheckCircle2 size={15} /> Approve</button>
                      <button type="button" className="sr-reject" disabled={busy} onClick={() => review(o, false)}><XCircle size={15} /> Reject</button>
                    </>
                  )}
                  {admin && <button type="button" className="sr-delete" title="Delete" aria-label={`Delete ${o.name}`} onClick={() => askDelete({ name: o.name, email: o.email, userId: o.user_id, order: o })}>
                    <Trash2 size={15} />
                  </button>}
                </div>
              </article>
            );
          })}
          {!rows.length && <p className="sr-empty">No registrations match. Try “All courses” and “All”, or check the accounts below.</p>}
        </div>
      </section>
      {admin && <section className="lms-panel sr-list">
        <h3><UserPlus size={19} /> Accounts with no course yet {accounts && <span className="sr-count">{filteredAccounts.length}</span>}</h3>
        <p className="sr-help">People who created a Training Centre account but haven&apos;t registered for a course (including affiliates and instructors). Message them to help them choose a course, or give access in the Access tab.</p>
        {!accounts ? (
          <p>Loading accounts…</p>
        ) : filteredAccounts.length ? (
          <div className="sr-table">
            {filteredAccounts.map((a) => {
              return (
                <article key={a.user_id} className="sr-row">
                  <div className="sr-person">
                    <button type="button" className="sr-name" onClick={() => setProfile(a.user_id)} title="Open contact history">{a.name || "No name yet"}</button>
                    <small>{a.email}</small>
                    <small>{a.phone}</small>
                  </div>
                  <div className="sr-course-cell">
                    <span className="sr-status muted">{a.role}</span>
                    <small>Account created {ago(a.created_at)}{a.city ? ` · ${a.city}` : ""}</small>
                  </div>
                  <div className="sr-status-cell">
                    <small>{a.last_sign_in_at ? `Last signed in ${ago(a.last_sign_in_at)}` : "Never signed in"}</small>
                    {lastContact(a.user_id) && <small className="sr-last"><Send size={11} /> {lastContact(a.user_id)}</small>}
                  </div>
                  <div className="sr-actions">
                    <button type="button" className="lms-text sr-history" onClick={() => setProfile(a.user_id)}><History size={15} /><span>History</span></button>
                    <button type="button" className="sr-contact" onClick={() => setContact({ recipients: [fromAccount(a)], template: "choose_course" })}>
                      <Send size={15} /> Contact
                    </button>
                    <button type="button" className="sr-delete" title="Delete account" aria-label={`Delete ${a.name || a.email}`} onClick={() => askDelete({ name: a.name || a.email, email: a.email, userId: a.user_id })}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="sr-empty">Everyone with an account has registered for a course.</p>
        )}
      </section>}
    </div>
  );
}
