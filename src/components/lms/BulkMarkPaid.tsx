"use client";
import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { money } from "@/lib/lms/types";

type Preview = {
  course: { id: string; title: string; currency: string; amount: number };
  order_ids: string[];
  total: number;
  registrations: { id: string; name: string; email: string }[];
};
type State = { kind: "idle" } | { kind: "loading" } | { kind: "preview"; data: Preview } | { kind: "saving"; data: Preview };

// Key this component by course so a confirmation can never carry into another roster.
export default function BulkMarkPaid({ courseId, selectedOrderIds, disabled, onChanged }: {
  courseId: string; selectedOrderIds: string[]; disabled: boolean; onChanged: () => Promise<void>;
}) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const working = state.kind === "loading" || state.kind === "saving";
  const close = () => { setState({ kind: "idle" }); trigger.current?.focus(); };

  async function preview() {
    if (!selectedOrderIds.length) return;
    const requested = new Set(selectedOrderIds);
    setState({ kind: "loading" }); setProblem(""); setNotice(""); setNote("");
    try {
      const query = new URLSearchParams({ course: courseId });
      requested.forEach(id => query.append("order_id", id));
      const response = await authFetch(`/api/lms-bulk-paid?${query}`);
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Could not load pending registrations.");
      if (data.course?.id !== courseId || !Array.isArray(data.order_ids) || new Set(data.order_ids).size !== data.order_ids.length || !data.order_ids.every((id: string) => requested.has(id)) || !Array.isArray(data.registrations) || data.registrations.length !== data.order_ids.length || new Set(data.registrations.map((row: { id: string }) => row.id)).size !== data.order_ids.length || !data.registrations.every((row: { id: string }) => data.order_ids.includes(row.id))) throw Error("Could not verify the selected course.");
      if (!data.order_ids.length) { setNotice("None of the selected registrations are still pending. Refresh the roster and select a pending student."); close(); return; }
      setState({ kind: "preview", data });
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Could not load pending registrations."); close();
    }
  }

  async function confirm() {
    if (state.kind !== "preview" || note.trim().length < 3 || saving.current) return;
    const data = state.data;
    saving.current = true; setState({ kind: "saving", data }); setProblem("");
    try {
      const response = await authFetch("/api/lms-bulk-paid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course_id: courseId, order_ids: data.order_ids, note: note.trim() }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not mark registrations paid.");
      close();
      setNotice(`Marked ${result.updated_count} registration${result.updated_count === 1 ? "" : "s"} as paid. ${result.skipped_count ? `${result.skipped_count} skipped because their status changed or a card checkout is active. ` : ""}${result.welcome_queued_count ? `${result.welcome_queued_count} welcome email${result.welcome_queued_count === 1 ? "" : "s"} queued with dashboard and class preparation guidance.` : "No new welcome emails needed."}`);
      try { await onChanged(); } catch { setProblem("Changes were saved. Reload this page to refresh the roster."); }
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Could not mark registrations paid.");
      setState({ kind: "preview", data });
    } finally { saving.current = false; }
  }

  return <section aria-label="Selected payment status">
    <button ref={trigger} type="button" className="lms-button" disabled={disabled || working || !selectedOrderIds.length} onClick={preview}>
      <CheckCircle2 size={16} /> {state.kind === "loading" ? "Checking pending registrations…" : selectedOrderIds.length ? `Mark ${selectedOrderIds.length} selected student${selectedOrderIds.length === 1 ? "" : "s"} as paid` : "Mark selected students as paid"}
    </button>
    {!selectedOrderIds.length && <p>Select the checkbox beside a pending student to mark their registration as paid.</p>}
    {notice && <p className="lms-notice" role="status">{notice}</p>}
    {problem && state.kind === "idle" && <p className="lms-error" role="alert">{problem}</p>}
    {(state.kind === "preview" || state.kind === "saving") && <div className="sr-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-paid-title" onKeyDown={event => { if (event.key === "Escape" && !working) close(); }}>
      <div className="sr-modal-card">
        <h3 id="bulk-paid-title">Mark selected students as paid?</h3>
        <p><strong>{state.data.course.title}</strong></p>
        <p>Only these <strong>{state.data.order_ids.length} selected pending registration{state.data.order_ids.length === 1 ? "" : "s"}</strong> will be marked as paid. Unselected students will stay unchanged.</p>
        <ul>{state.data.registrations.map(row => <li key={row.id}><strong>{row.name}</strong> · {row.email}</li>)}</ul>
        <p>{state.data.total === 0 ? "These registrations have no participant fee. Their amounts stay at zero." : `Recorded total: ${money(state.data.total, state.data.course.currency)}. Confirm payment has been received before continuing.`}</p>
        <p>Existing paid, approved, rejected and refunded registrations stay unchanged. Active card checkouts are skipped. This updates status and course access without charging cards. Each newly paid student will receive a welcome email with dashboard links and preparation steps.</p>
        <label>Reason for the audit record<textarea autoFocus value={note} onChange={event => setNote(event.target.value)} maxLength={500} disabled={working} placeholder="For example: BLP participant approval" /></label>
        {problem && <p className="lms-error" role="alert">{problem}</p>}
        <div className="sr-actions">
          <button type="button" className="lms-text" disabled={working} onClick={close}>Cancel</button>
          <button type="button" className="lms-button" disabled={working || note.trim().length < 3} onClick={confirm}>{working ? "Saving…" : `Confirm ${state.data.order_ids.length} as paid`}</button>
        </div>
      </div>
    </div>}
  </section>;
}
