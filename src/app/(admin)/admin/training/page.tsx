"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { authFetch } from "@/lib/auth-fetch";
import {
  attendance,
  locations,
  statuses,
  initialCohort,
  type Cohort,
} from "@/lib/training/config";
import type { Registration } from "@/lib/training/schema";
export default function TrainingAdmin() {
  const [rows, setRows] = useState<Registration[]>([]),
    [count, setCount] = useState(0),
    [page, setPage] = useState(0),
    [cohort, setCohort] = useState<Cohort>(initialCohort),
    [filter, setFilter] = useState({
      cohort: initialCohort.id,
      location: "",
      attendance: "",
      status: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const loadVersion=useRef(0);
  const query = new URLSearchParams({
    ...filter,
    page: String(page),
  }).toString();
  const load = useCallback(async () => {
    const version=++loadVersion.current;
    setError("");
    try {
      const r = await authFetch(`/api/admin/training?${query}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to load registrations");
      if(version!==loadVersion.current)return;
      setRows(d.registrations);
      setCount(d.count);
      setCohort(d.cohort);
    } catch (e) {
      if(version===loadVersion.current)setError(e instanceof Error ? e.message : "Unable to load registrations");
    }
  }, [query]);
  useEffect(() => {
    void load();
  }, [load]);
  async function action(url: string, method: string, body: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const r = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Update failed");
      await load();
      setMessage(
        "Saved. Notification states below show provider acceptance or pending retry.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }
  async function exportCSV() {
    setBusy(true);
    try {
      const r = await authFetch(`/api/admin/training?${query}&format=csv`);
      if (!r.ok) throw new Error("Export failed");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "vanuatu-training.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-deep-blue">
            Training registrations
          </h1>
          <p className="text-gray-600 mt-2">
            Manual follow-up and payment. A registration is not a paid place.
          </p>
        </div>
        <button
          disabled={busy}
          onClick={exportCSV}
          className="px-5 py-3 rounded-lg bg-deep-blue text-white"
        >
          Export filtered CSV
        </button>
      </div>
      <div className="my-6 bg-white border p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <p>
          October registration: <strong>{cohort.registrationState}</strong>
        </p>
        <button
          disabled={busy}
          className="underline font-semibold text-deep-blue"
          onClick={() =>
            action("/api/admin/training/cohort", "PATCH", {
              registrationState:
                cohort.registrationState === "open" ? "closed" : "open",
            })
          }
        >
          {cohort.registrationState === "open"
            ? "Close registration"
            : "Reopen registration"}
        </button>
        <p className="text-xs text-gray-500">
          Registration also closes automatically when the teaching period ends.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["cohort", "Cohort", { [initialCohort.id]: "October 2026" }],
          ["location", "Location", locations],
          ["attendance", "Attendance", attendance],
          [
            "status",
            "Status",
            Object.fromEntries(statuses.map((s) => [s, s.replace("_", " ")])),
          ],
        ].map(([key, label, choices]) => (
          <label key={String(key)} className="text-sm font-semibold">
            {String(label)}
            <select
              className="block mt-2 border rounded-lg p-3 w-full bg-white"
              disabled={busy}
              aria-label={String(label)}
              value={filter[key as keyof typeof filter]}
              onChange={(e) => {
                setPage(0);
                setFilter({ ...filter, [String(key)]: e.target.value });
              }}
            >
              {key !== "cohort" && <option value="">All</option>}
              {Object.entries(choices).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-red-700 p-4 bg-red-50 mb-4">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-green-800 mb-4">
          {message}
        </p>
      )}
      <p className="text-sm text-gray-500 mb-3">
        {count} registration{count === 1 ? "" : "s"}
      </p>
      <div className="space-y-4">
        {rows.map((row) => (
          <details key={row.id} className="bg-white border rounded-xl p-5">
            <summary className="cursor-pointer">
              <span className="font-bold text-deep-blue">{row.full_name}</span>
              <span className="ml-3 text-sm text-gray-600">
                {locations[row.location_code]} ·{" "}
                {attendance[row.attendance_preference]} ·{" "}
                {row.status.replace("_", " ")}
              </span>
            </summary>
            <div className="grid md:grid-cols-2 gap-5 mt-5 text-sm">
              <div className="space-y-2 break-words">
                <p>
                  <strong>Reference:</strong> {row.reference}
                </p>
                <p>
                  <strong>Email:</strong> {row.email}
                </p>
                <p>
                  <strong>Phone:</strong> {row.phone_normalized}
                </p>
                <p>
                  <strong>Location detail:</strong> {row.location_other}{" "}
                  {row.area_optional}
                </p>
                <p>
                  <strong>Business direction:</strong>{" "}
                  {row.business_direction || "Not supplied"}
                </p>
                <p className="whitespace-pre-wrap">
                  <strong>Question:</strong> {row.question || "None"}
                </p>
                <p>
                  <strong>Future training updates:</strong>{" "}
                  {row.future_training_opt_in ? "Opted in" : "Not opted in"}
                </p>
                <p>
                  <strong>Privacy acknowledged:</strong> {row.acknowledged_at} (
                  {row.privacy_version})
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(row.created_at).toLocaleString("en-GB", {
                    timeZone: "Pacific/Efate",
                  })}{" "}
                  Vanuatu time
                </p>
                {(row.pwd_training_receipts?.length || 0) > 1 && (
                  <p>
                    <strong>Follow-up receipt references:</strong>{" "}
                    {row.pwd_training_receipts
                      ?.map((x) => x.reference)
                      .join(", ")}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">
                  Registration status
                  <select
                    aria-label={`Status for ${row.full_name}`}
                    disabled={busy}
                    className="block border rounded p-3 mt-2 w-full"
                    value={row.status}
                    onChange={(e) =>
                      action(`/api/admin/training/${row.id}`, "PATCH", {
                        status: e.target.value,
                      })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const d = new FormData(e.currentTarget);
                    void action(`/api/admin/training/${row.id}`, "PATCH", {
                      status: row.status,
                      private_notes: d.get("notes"),
                    });
                  }}
                >
                  <label className="block">
                    Private notes
                    <textarea
                      name="notes"
                      className="block border rounded p-3 mt-2 w-full"
                      rows={3}
                      maxLength={2000}
                      defaultValue={row.private_notes}
                    />
                  </label>
                  <button disabled={busy} className="mt-2 underline">
                    Save notes
                  </button>
                </form>
                <div className="bg-slate-50 p-3 rounded">
                  <p>
                    Student email: {row.student_email_state.replace("_", " ")}
                  </p>
                  <p>
                    Internal email: {row.internal_email_state.replace("_", " ")}
                  </p>
                  <p>Attempts: {row.email_attempts}</p>
                  {row.student_email_state === "pending" ||
                  row.internal_email_state === "pending" ? (
                    <button
                      disabled={busy}
                      className="mt-2 underline font-semibold"
                      onClick={() =>
                        action(`/api/admin/training/${row.id}`, "POST", {})
                      }
                    >
                      Retry pending emails
                    </button>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-2">
                    Test accepted means delivery to the provider’s sandbox, not
                    the student or company. Accepted does not guarantee inbox
                    receipt.
                  </p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
      {!rows.length && !error && (
        <p className="p-8 bg-white border rounded-xl">
          No registrations match these filters.
        </p>
      )}
      <div className="flex gap-5 items-center mt-6">
        <button
          disabled={page === 0 || busy}
          className="disabled:opacity-40 underline"
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button
          disabled={(page + 1) * 50 >= count || busy}
          className="disabled:opacity-40 underline"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
