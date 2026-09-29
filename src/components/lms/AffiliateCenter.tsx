"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  Check,
  MousePointerClick,
  UserPlus,
  BadgeCheck,
  Wallet,
  Share2,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { money } from "@/lib/lms/types";
import { programs } from "@/lib/lms/programs";
type Affiliate = {
  code: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  commission_rate: number;
  full_name: string;
  phone: string;
  payout_method: "bank" | "mobile_money" | "other";
  payout_details: string;
  promotion_plan: string;
};
type AffiliateCourse = {
  id: string;
  slug: string;
  title: string;
  amount: number;
  currency: string;
  enrollment_open: boolean;
  cohort_id: string | null;
};
type Commission = {
  id: string;
  course_id: string;
  currency: string;
  order_amount: number;
  rate: number;
  amount: number;
  status: "pending" | "approved" | "paid" | "void";
  paid_at: string | null;
  created_at: string;
};
type Referral = {
  id: string;
  name: string;
  course_id: string;
  status: string;
  referred_at: string;
};
type Data = {
  affiliate: Affiliate | null;
  courses: AffiliateCourse[];
  clicks?: number;
  referrals?: Referral[];
  commissions?: Commission[];
};
const commissionLabel = {
  pending: "Pending review",
  approved: "Approved — awaiting payout",
  paid: "Paid",
  void: "Cancelled (refund)",
};
const methodLabel = {
  bank: "Bank transfer",
  mobile_money: "Mobile money",
  other: "Other",
};
async function api(body?: unknown) {
  const r = await authFetch(
    "/api/lms-affiliates",
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Unable to load the affiliate programme.");
  return d;
}
// Sums commission amounts per currency so VUV and AUD totals never mix.
function totals(list: Commission[], statuses: Commission["status"][]) {
  const sums = new Map<string, number>();
  for (const c of list)
    if (statuses.includes(c.status))
      sums.set(c.currency, (sums.get(c.currency) || 0) + c.amount);
  return sums.size
    ? Array.from(sums, ([cur, n]) => money(n, cur)).join(" + ")
    : money(0, "VUV");
}
export default function AffiliateCenter({ email }: { email: string }) {
  const [data, setData] = useState<Data | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [copied, setCopied] = useState(""),
    [editingPayout, setEditingPayout] = useState(false);
  const load = useCallback(async () => setData(await api()), []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  async function submit(e: React.FormEvent<HTMLFormElement>, action: string) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api({
        action,
        full_name: f.get("full_name"),
        phone: f.get("phone"),
        payout_method: f.get("payout_method"),
        payout_details: f.get("payout_details"),
        promotion_plan: f.get("promotion_plan"),
        agree: f.get("agree") === "on" || undefined,
      });
      await load();
      setEditingPayout(false);
      setMessage(
        action === "apply"
          ? "Application sent. We will email you once it has been reviewed."
          : "Payout details saved.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  }
  if (!data)
    return (
      <section className="sd-panel">
        {error ? (
          <div className="lms-alert" role="alert">
            {error}
          </div>
        ) : (
          "Loading the affiliate programme…"
        )}
      </section>
    );
  const a = data.affiliate;
  const alerts = (
    <>
      {error && (
        <div className="lms-alert" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="lms-notice" role="status">
          {message}
        </div>
      )}
    </>
  );
  const payoutFields = (
    <>
      <label>
        Phone / WhatsApp
        <input name="phone" type="tel" required minLength={5} maxLength={40} defaultValue={a?.phone} />
      </label>
      <label>
        How should we pay you?
        <select name="payout_method" defaultValue={a?.payout_method || "bank"}>
          {Object.entries(methodLabel).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="af-wide">
        Payout details
        <textarea
          name="payout_details"
          required
          minLength={5}
          maxLength={600}
          defaultValue={a?.payout_details}
          placeholder="Bank name, account name and account number — or your mobile money number."
        />
      </label>
    </>
  );
  if (!a || a.status === "rejected")
    return (
      <>
        {alerts}
        <section className="sd-panel">
          <div className="sd-section-title">
            <div>
              <h2>Earn by sharing our courses</h2>
              <p>
                Get your own course links. When someone enrols and pays
                through your link, you earn <strong>15% commission</strong> on
                the amount they pay.
              </p>
            </div>
          </div>
          <ul className="af-points">
            <li>Share your link on WhatsApp, Facebook or anywhere you like.</li>
            <li>
              Anyone who opens your link is credited to you for 30 days.
            </li>
            <li>
              Commissions are paid to your bank or mobile money after the
              student&apos;s payment is confirmed.
            </li>
          </ul>
          {a?.status === "rejected" && (
            <div className="lms-alert">
              Your previous application was not approved. You can update your
              details and apply again.
            </div>
          )}
        </section>
        <form className="sd-panel sd-profile-form" onSubmit={(e) => submit(e, "apply")}>
          <h2>Apply to become an affiliate</h2>
          <fieldset disabled={busy}>
            <div className="sd-form-grid">
              <label>
                Full name
                <input name="full_name" required minLength={2} maxLength={120} defaultValue={a?.full_name} />
              </label>
              <label>
                Account email
                <input value={email} disabled readOnly />
              </label>
              {payoutFields}
              <label className="af-wide">
                How will you promote our courses?
                <textarea
                  name="promotion_plan"
                  required
                  minLength={10}
                  maxLength={1500}
                  defaultValue={a?.promotion_plan}
                  placeholder="e.g. my Facebook page with 2,000 followers, church and community WhatsApp groups…"
                />
              </label>
            </div>
            <label className="af-check">
              <input type="checkbox" name="agree" required />I will promote
              honestly, will not spam, and will not use my own link to buy
              courses for myself.
            </label>
            <div className="sd-form-actions">
              <span>We review every application, usually within 2 working days.</span>
              <button className="lms-button">Send application</button>
            </div>
          </fieldset>
        </form>
      </>
    );
  if (a.status === "pending" || a.status === "suspended")
    return (
      <section className="sd-panel">
        {alerts}
        <h2>
          {a.status === "pending"
            ? "Your application is being reviewed"
            : "Your affiliate links are paused"}
        </h2>
        <p>
          {a.status === "pending"
            ? "Thanks for applying. We will email you when your affiliate links are ready."
            : "New referrals are not being tracked right now. Commissions you already earned are unaffected. Contact training support if you have questions."}
        </p>
      </section>
    );
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = (to: string) =>
    `${origin}/go/${a.code}${to === "/training-center" ? "" : `?to=${to}`}`;
  const commissions = data.commissions || [],
    referrals = data.referrals || [];
  const courseTitle = (id: string) =>
    data.courses.find((c) => c.id === id)?.title || "Course";
  const links = [
    { title: "All courses", to: "/training-center" },
    ...data.courses
      .filter((c) => c.enrollment_open)
      .map((c) => ({
        title: c.title,
        // Cohort courses sell from their own landing page; the catch-all 404s their programme slug.
        to: c.cohort_id
          ? "/vanuatu-training"
          : programs[c.slug]
            ? `/training-center/programs/${c.slug}`
            : "/training-center",
        detail: `${money(c.amount, c.currency)} · you earn ${money(Math.floor((c.amount * a.commission_rate) / 100), c.currency)}`,
      })),
  ];
  return (
    <>
      {alerts}
      <div className="sd-stats">
        {[
          [MousePointerClick, data.clicks || 0, "Link visits"],
          [UserPlus, referrals.length, "Referred sign-ups"],
          [BadgeCheck, commissions.filter((c) => c.status !== "void").length, "Paid enrolments"],
          [Wallet, totals(commissions, ["paid"]), "Paid to you"],
        ].map(([Icon, value, label]) => {
          const I = Icon as typeof Wallet;
          return (
            <div key={String(label)}>
              <I size={22} />
              <strong>{String(value)}</strong>
              <span>{String(label)}</span>
            </div>
          );
        })}
      </div>
      <section className="sd-panel">
        <div className="sd-section-title">
          <div>
            <h2>Your affiliate links</h2>
            <p>
              Your code is <strong>{a.code}</strong>. You earn{" "}
              {a.commission_rate}% of what each referred student pays.
              Referrals are remembered for 30 days.
            </p>
          </div>
        </div>
        <div className="af-links">
          {links.map((l) => {
            const url = link(l.to);
            return (
              <div key={l.title} className="af-link">
                <div>
                  <strong>{l.title}</strong>
                  {"detail" in l && <small>{l.detail}</small>}
                  <code>{url}</code>
                </div>
                <div className="af-actions">
                  <button type="button" className="lms-button" onClick={() => copy(url)}>
                    {copied === url ? <Check size={16} /> : <Copy size={16} />}
                    {copied === url ? "Copied" : "Copy link"}
                  </button>
                  <a
                    className="lms-text"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://wa.me/?text=${encodeURIComponent(`${l.title} — Pacific Wave Digital Training: ${url}`)}`}
                  >
                    <Share2 size={15} /> WhatsApp
                  </a>
                  <a
                    className="lms-text"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  >
                    <Share2 size={15} /> Facebook
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="sd-panel">
        <div className="sd-section-title">
          <div>
            <h2>Your earnings</h2>
            <p>
              Pending: {totals(commissions, ["pending"])} · Approved, awaiting
              payout: {totals(commissions, ["approved"])} · Paid:{" "}
              {totals(commissions, ["paid"])}
            </p>
          </div>
        </div>
        {commissions.length ? (
          <div className="ec-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Student paid</th>
                  <th>Your commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>{courseTitle(c.course_id)}</td>
                    <td>{money(c.order_amount, c.currency)}</td>
                    <td>
                      {money(c.amount, c.currency)} ({c.rate}%)
                    </td>
                    <td>
                      {commissionLabel[c.status]}
                      {c.paid_at && <small className="af-muted">{new Date(c.paid_at).toLocaleDateString()}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No commissions yet. They appear here once a referred student pays.</p>
        )}
      </section>
      <section className="sd-panel">
        <h2>People who signed up through your link</h2>
        {referrals.length ? (
          <div className="ec-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.referred_at).toLocaleDateString()}</td>
                    <td>{r.name}</td>
                    <td>{courseTitle(r.course_id)}</td>
                    <td>
                      <span className="sd-status" data-status={r.status}>
                        {["paid", "granted"].includes(r.status)
                          ? "Enrolled"
                          : r.status === "review"
                            ? "Payment in review"
                            : r.status === "refunded"
                              ? "Refunded"
                              : "Not paid yet"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No sign-ups yet. Share your links to get started.</p>
        )}
      </section>
      <section className="sd-panel">
        <div className="sd-account-row">
          <div>
            <h2>Payout details</h2>
            <p>
              {methodLabel[a.payout_method]} · {a.payout_details}
            </p>
          </div>
          {!editingPayout && (
            <button type="button" className="lms-text" onClick={() => setEditingPayout(true)}>
              Change
            </button>
          )}
        </div>
        {editingPayout && (
          <form className="sd-profile-form" onSubmit={(e) => submit(e, "payout")}>
            <fieldset disabled={busy}>
              <div className="sd-form-grid">{payoutFields}</div>
              <div className="sd-form-actions">
                <button type="button" className="lms-text" onClick={() => setEditingPayout(false)}>
                  Cancel
                </button>
                <button className="lms-button">Save payout details</button>
              </div>
            </fieldset>
          </form>
        )}
      </section>
    </>
  );
}
