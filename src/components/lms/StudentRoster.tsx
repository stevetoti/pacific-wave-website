"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, FileText, Mail, MessageCircle, Phone, Search, UserPlus, XCircle } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { money, paymentReference, type Course, type Order } from "@/lib/lms/types";
type Account = { user_id: string; email: string; name: string; phone: string; city: string; created_at: string; last_sign_in_at: string | null; role: string };
type Group = "all" | "enrolled" | "review" | "unpaid" | "other";
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
const whatsapp = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits.length <= 7 ? "678" + digits : digits}` : "";
};
export default function StudentRoster({
  orders,
  courses,
  busy,
  save,
}: {
  orders: Order[];
  courses: Course[];
  busy: boolean;
  save: (body: unknown) => Promise<void>;
}) {
  const [course, setCourse] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  useEffect(() => {
    authFetch("/api/lms-students")
      .then(async (r) => (r.ok ? setAccounts((await r.json()).accounts) : setAccounts([])))
      .catch(() => setAccounts([]));
  }, []);
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
  return (
    <div className="sr">
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
      {toReview.length > 0 && (
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
        <div className="sr-table">
          {rows.map((o) => {
            const s = statusInfo[o.status] || { label: o.status, tone: "muted" };
            const wa = whatsapp(o.phone);
            return (
              <article key={o.id} className="sr-row">
                <div className="sr-person">
                  <strong>{o.name}</strong>
                  <small>{o.email}</small>
                  <small>{o.phone}</small>
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
                  <small>
                    {money(o.amount, o.currency)}
                    {o.coupon_code ? ` · coupon ${o.coupon_code}` : ""}
                    {o.method ? ` · ${o.method === "bank" ? `bank${o.bank ? ` (${o.bank})` : ""}` : o.method}` : ""}
                  </small>
                  <small>Ref {paymentReference(o.id)}</small>
                </div>
                <div className="sr-actions">
                  <a href={`/training-center/dashboard?tab=messages&with=${o.user_id}`} target="_blank" rel="noreferrer" title="Message in the Training Centre"><MessageCircle size={16} /><span>Message</span></a>
                  <a href={`mailto:${o.email}`} title="Email"><Mail size={16} /><span>Email</span></a>
                  {wa && <a href={wa} target="_blank" rel="noreferrer" title="WhatsApp"><Phone size={16} /><span>WhatsApp</span></a>}
                  {o.status === "review" && (
                    <>
                      <button type="button" className="sr-approve" disabled={busy} onClick={() => review(o, true)}><CheckCircle2 size={15} /> Approve</button>
                      <button type="button" className="sr-reject" disabled={busy} onClick={() => review(o, false)}><XCircle size={15} /> Reject</button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
          {!rows.length && <p className="sr-empty">No registrations match. Try “All courses” and “All”, or check the accounts below.</p>}
        </div>
      </section>
      <section className="lms-panel sr-list">
        <h3><UserPlus size={19} /> Accounts with no course yet {accounts && <span className="sr-count">{filteredAccounts.length}</span>}</h3>
        <p className="sr-help">People who created a Training Centre account but haven&apos;t registered for a course (including affiliates and instructors). Message them to help them choose a course, or give access in the Access tab.</p>
        {!accounts ? (
          <p>Loading accounts…</p>
        ) : filteredAccounts.length ? (
          <div className="sr-table">
            {filteredAccounts.map((a) => {
              const wa = whatsapp(a.phone);
              return (
                <article key={a.user_id} className="sr-row">
                  <div className="sr-person">
                    <strong>{a.name || "No name yet"}</strong>
                    <small>{a.email}</small>
                    <small>{a.phone}</small>
                  </div>
                  <div className="sr-course-cell">
                    <span className="sr-status muted">{a.role}</span>
                    <small>Account created {ago(a.created_at)}{a.city ? ` · ${a.city}` : ""}</small>
                  </div>
                  <div className="sr-status-cell">
                    <small>{a.last_sign_in_at ? `Last signed in ${ago(a.last_sign_in_at)}` : "Never signed in"}</small>
                  </div>
                  <div className="sr-actions">
                    <a href={`mailto:${a.email}`} title="Email"><Mail size={16} /><span>Email</span></a>
                    {wa && <a href={wa} target="_blank" rel="noreferrer" title="WhatsApp"><Phone size={16} /><span>WhatsApp</span></a>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="sr-empty">Everyone with an account has registered for a course.</p>
        )}
      </section>
    </div>
  );
}
