"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { money } from "@/lib/lms/types";
type Affiliate = {
  id: string;
  code: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  commission_rate: number;
  full_name: string;
  email: string;
  phone: string;
  payout_method: string;
  payout_details: string;
  promotion_plan: string;
  admin_note: string;
  created_at: string;
  pwd_lms_affiliate_clicks: { count: number }[];
};
type Commission = {
  id: string;
  affiliate_id: string;
  currency: string;
  order_amount: number;
  rate: number;
  amount: number;
  status: "pending" | "approved" | "paid" | "void";
  payout_reference: string;
  note: string;
  order_refunded_at: string | null;
  created_at: string;
  pwd_lms_courses: { title: string } | null;
  pwd_lms_orders: { name: string; email: string } | null;
};
type Data = {
  settings: { auto_approve: boolean };
  affiliates: Affiliate[];
  commissions: Commission[];
  referrals: { affiliate_id: string; status: string }[];
};
const sum = (list: Commission[]) => {
  const m = new Map<string, number>();
  for (const c of list) m.set(c.currency, (m.get(c.currency) || 0) + c.amount);
  return m.size ? Array.from(m, ([cur, n]) => money(n, cur)).join(" + ") : "—";
};
export default function AffiliateAdmin() {
  const [data, setData] = useState<Data | null>(null),
    [edit, setEdit] = useState<Affiliate | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [statusFilter, setStatusFilter] = useState("pending"),
    [affiliateFilter, setAffiliateFilter] = useState(""),
    [reference, setReference] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const r = await authFetch("/api/lms-affiliates?scope=admin");
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "Unable to load affiliates");
    setData(d);
  }, []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  async function post(body: unknown, done: string) {
    if (busy) return false;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await authFetch("/api/lms-affiliates?scope=admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Save failed");
      await load();
      setMessage(
        typeof d.updated === "number" ? `${done} (${d.updated} updated).` : done,
      );
      setSelected([]);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const commissions = useMemo(
    () =>
      (data?.commissions || []).filter(
        (c) =>
          (!statusFilter || c.status === statusFilter) &&
          (!affiliateFilter || c.affiliate_id === affiliateFilter),
      ),
    [data, statusFilter, affiliateFilter],
  );
  if (!data)
    return (
      <section className="lms-panel">
        {error ? <p className="lms-alert">{error}</p> : "Loading affiliates…"}
      </section>
    );
  const byAffiliate = (id: string, status?: Commission["status"]) =>
    data.commissions.filter(
      (c) => c.affiliate_id === id && (!status || c.status === status),
    );
  const name = (id: string) =>
    data.affiliates.find((a) => a.id === id)?.full_name || "Affiliate";
  return (
    <>
      {error && <p className="lms-alert" role="alert">{error}</p>}
      {message && <p className="lms-notice" role="status">{message}</p>}
      <section className="lms-panel">
        <h2>Affiliates</h2>
        <p>
          Anyone with an account can join from /affiliates or their dashboard.
          Affiliates share /go/CODE links; a paid referred enrolment creates a
          pending commission automatically. Refunds cancel unpaid commissions.
        </p>
        <label className="af-check">
          <input
            type="checkbox"
            checked={data.settings.auto_approve}
            disabled={busy}
            onChange={(e) =>
              post(
                { action: "settings", auto_approve: e.target.checked },
                e.target.checked
                  ? "Auto-approval on: new affiliates are approved instantly"
                  : "Auto-approval off: new applications wait for your review",
              )
            }
          />
          <span>
            <strong>Approve new affiliates automatically</strong>
            <small className="af-muted">
              New applicants get their links and a welcome email straight
              away. People you previously rejected always need your review.
            </small>
          </span>
        </label>
        <div className="ec-table">
          <table>
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Code</th>
                <th>Status</th>
                <th>Rate</th>
                <th>Visits / sign-ups</th>
                <th>Owed (approved)</th>
                <th>Paid</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.affiliates.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.full_name}
                    <small className="af-muted">{a.email}</small>
                  </td>
                  <td>{a.code}</td>
                  <td>
                    <span className="sd-status" data-status={a.status === "approved" ? "paid" : a.status === "pending" ? "review" : "rejected"}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.commission_rate}%</td>
                  <td>
                    {a.pwd_lms_affiliate_clicks?.[0]?.count || 0} /{" "}
                    {data.referrals.filter((r) => r.affiliate_id === a.id).length}
                  </td>
                  <td>{sum(byAffiliate(a.id, "approved"))}</td>
                  <td>{sum(byAffiliate(a.id, "paid"))}</td>
                  <td>
                    <button className="lms-text" onClick={() => setEdit(a)}>
                      {a.status === "pending" ? "Review" : "Manage"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.affiliates.length && <p>No affiliate applications yet.</p>}
        </div>
      </section>
      {edit && (
        <form
          key={edit.id}
          className="lms-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            post(
              {
                action: "review",
                id: edit.id,
                status: f.get("status"),
                commission_rate: Number(f.get("rate")),
                code: f.get("code"),
                admin_note: f.get("note") || "",
              },
              "Affiliate saved",
            ).then((ok) => ok && setEdit(null));
          }}
        >
          <h2>{edit.full_name}</h2>
          <p>
            {edit.email} · {edit.phone} · applied{" "}
            {new Date(edit.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Promotion plan:</strong> {edit.promotion_plan}
          </p>
          <p>
            <strong>Payout ({edit.payout_method.replace("_", " ")}):</strong>{" "}
            {edit.payout_details}
          </p>
          <fieldset disabled={busy}>
            <label>
              Status
              <select name="status" defaultValue={edit.status === "pending" ? "approved" : edit.status}>
                <option value="approved">Approved — links active</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended — stop tracking</option>
              </select>
            </label>
            <label>
              Commission rate (%)
              <input name="rate" type="number" min={0.5} max={100} step={0.5} required defaultValue={edit.commission_rate} />
            </label>
            <label>
              Link code
              <input name="code" required pattern="[A-Za-z0-9]{4,20}" defaultValue={edit.code} />
            </label>
            <label>
              Private admin note
              <textarea name="note" maxLength={1000} defaultValue={edit.admin_note} />
            </label>
            <p>
              Changing the status emails the affiliate. Changing the code
              breaks links they have already shared.
            </p>
            <button className="lms-button">Save affiliate</button>{" "}
            <button type="button" className="lms-text" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </fieldset>
        </form>
      )}
      <section className="lms-panel">
        <h2>Commissions</h2>
        <p>
          Approve a commission once the payment is final, then mark it paid
          after you transfer the money. Paid commissions cannot be changed.
        </p>
        <div className="af-filters">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setSelected([]); }} aria-label="Commission status">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved (owed)</option>
            <option value="paid">Paid</option>
            <option value="void">Cancelled</option>
          </select>
          <select value={affiliateFilter} onChange={(e) => { setAffiliateFilter(e.target.value); setSelected([]); }} aria-label="Affiliate">
            <option value="">All affiliates</option>
            {data.affiliates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name} ({a.code})
              </option>
            ))}
          </select>
          <strong>Total shown: {sum(commissions)}</strong>
        </div>
        <div className="ec-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={!!commissions.length && selected.length === commissions.length}
                    onChange={(e) => setSelected(e.target.checked ? commissions.map((c) => c.id) : [])}
                  />
                </th>
                <th>Date</th>
                <th>Affiliate</th>
                <th>Student / course</th>
                <th>Paid</th>
                <th>Commission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label="Select commission"
                      checked={selected.includes(c.id)}
                      onChange={(e) =>
                        setSelected((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))
                      }
                    />
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>{name(c.affiliate_id)}</td>
                  <td>
                    {c.pwd_lms_orders?.name}
                    <small className="af-muted">{c.pwd_lms_courses?.title}</small>
                  </td>
                  <td>{money(c.order_amount, c.currency)}</td>
                  <td>
                    {money(c.amount, c.currency)} ({c.rate}%)
                  </td>
                  <td>
                    {c.status}
                    {c.payout_reference && <small className="af-muted">Ref: {c.payout_reference}</small>}
                    {c.note && <small>{c.note}</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!commissions.length && <p>No commissions match this filter.</p>}
        </div>
        {selected.length > 0 && (
          <fieldset className="af-filters" disabled={busy}>
            <strong>{selected.length} selected</strong>
            <button type="button" className="lms-text" onClick={() => post({ action: "commissions", ids: selected, status: "approved" }, "Commissions approved")}>
              Approve
            </button>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={200}
              placeholder="Payment reference (optional)"
              aria-label="Payment reference"
            />
            <button
              type="button"
              className="lms-button"
              onClick={() => {
                if (confirm(`Mark ${selected.length} commission(s) as paid? This cannot be undone.`))
                  post({ action: "commissions", ids: selected, status: "paid", payout_reference: reference }, "Commissions marked paid").then((ok) => ok && setReference(""));
              }}
            >
              Mark paid
            </button>
            <button
              type="button"
              className="lms-text"
              onClick={() => {
                if (confirm(`Cancel ${selected.length} commission(s)?`))
                  post({ action: "commissions", ids: selected, status: "void", note: "Cancelled by admin" }, "Commissions cancelled");
              }}
            >
              Cancel commission
            </button>
          </fieldset>
        )}
      </section>
    </>
  );
}
