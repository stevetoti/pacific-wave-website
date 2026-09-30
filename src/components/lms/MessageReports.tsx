"use client";
import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
type Report = {
  id: string;
  reason: string;
  created_at: string;
  message_id: number | null;
  reporter_name?: string;
  participants: ({ full_name: string } | undefined)[];
  messages: { id: number; body: string; deleted: boolean; created_at: string; sender_name?: string; file_id: string | null }[];
};
// Admins only see direct-message conversations that a participant reported.
export default function MessageReports() {
  const [reports, setReports] = useState<Report[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const r = await authFetch("/api/lms-messages?scope=admin");
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "Unable to load reports");
    setReports(d.reports);
  }, []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  async function act(body: unknown, done: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await authFetch("/api/lms-messages?scope=admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Action failed");
      await load();
      setMessage(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="lms-panel">
      <h2>Message reports</h2>
      <p>
        Direct messages are private. You only see a conversation here after a
        participant reports it. Remove harmful messages, then resolve the
        report. Use Course communication for group chat moderation.
      </p>
      {error && <p className="lms-alert" role="alert">{error}</p>}
      {message && <p className="lms-notice" role="status">{message}</p>}
      {!reports ? (
        <p>Loading reports…</p>
      ) : !reports.length ? (
        <p>No open reports.</p>
      ) : (
        reports.map((r) => (
          <article key={r.id} className="mr-report">
            <header>
              <strong>
                {r.participants.map((p) => p?.full_name || "Unknown").join(" ↔ ")}
              </strong>
              <small>
                Reported by {r.reporter_name || "a participant"} on{" "}
                {new Date(r.created_at).toLocaleString()}
              </small>
              <p>“{r.reason}”</p>
            </header>
            <div className="mr-messages">
              {r.messages.map((m) => (
                <div key={m.id} className={`mr-message ${m.id === r.message_id ? "flagged" : ""}`}>
                  <small>
                    {m.sender_name} · {new Date(m.created_at).toLocaleString()}
                  </small>
                  <p>{m.deleted ? <em>Removed</em> : m.body || (m.file_id ? "[attachment]" : "")}</p>
                  {!m.deleted && (
                    <button
                      type="button"
                      className="lms-text"
                      disabled={busy}
                      onClick={() => {
                        if (confirm("Remove this message for both people?"))
                          act({ action: "remove_message", message_id: m.id, report_id: r.id }, "Message removed and report resolved.");
                      }}
                    >
                      Remove message
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="lms-button" disabled={busy} onClick={() => act({ action: "resolve", id: r.id }, "Report resolved.")}>
              Resolve without changes
            </button>
          </article>
        ))
      )}
    </section>
  );
}
