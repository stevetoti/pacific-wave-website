"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { coaches, type CoachRole } from "@/lib/lms/coach/catalog";
import { plainText, type CoachReport } from "@/lib/lms/coach/report";
import styles from "./sessions.module.css";
type Session = {
  id: string;
  title: string | null;
  role: CoachRole;
  course_id: string;
  created_at: string;
  state: string;
  transcript?: { role: string; content: string }[];
  pwd_lms_courses: { title: string };
  pwd_lms_coach_reports?: { state: string; email_state: string } | null;
};
type Details = {
  session: Session;
  report: {
    state: string;
    report: CoachReport | null;
    email_state: string;
    error: string | null;
  } | null;
};
async function get(path: string) {
  const r = await authFetch(path);
  if (r.status === 401)
    throw Error("Please sign in to view your private sessions.");
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Could not load sessions");
  return d;
}
export default function CoachSessions() {
  const q = useSearchParams(),
    id = q.get("session"),
    course = q.get("course");
  const [rows, setRows] = useState<Session[]>([]),
    [total, setTotal] = useState(0),
    [offset, setOffset] = useState(0),
    [detail, setDetail] = useState<Details | null>(null),
    [title, setTitle] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setTitle("");
    setLoading(true);
    let stop = false;
    const load = async () => {
      try {
        const d = await get(
          id
            ? `/api/lms-coach/sessions?id=${id}`
            : `/api/lms-coach/sessions?offset=${offset}${course ? `&course=${course}` : ""}`,
        );
        if (stop) return;
        if (id) {
          setDetail(d);
          setTitle(
            (current) =>
              current ||
              d.session.title ||
              coaches[d.session.role as CoachRole].title,
          );
        } else {
          setRows(d.sessions);
          setTotal(d.total || 0);
          setDetail(null);
        }
        setError("");
      } catch (e) {
        if (!stop)
          setError(e instanceof Error ? e.message : "Unable to load sessions");
      } finally {
        if (!stop) setLoading(false);
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [id, course, offset]);
  async function rename() {
    if (!id) return;
    setBusy(true);
    try {
      const r = await authFetch("/api/lms-coach/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      });
      if (!r.ok) throw Error("Could not rename this session");
      setDetail((d) => (d ? { ...d, session: { ...d.session, title } } : d));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    try {
      const r = await authFetch(`/api/lms-coach/sessions?id=${id}&pdf=1`);
      if (!r.ok) throw Error("Your PDF is not ready yet.");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "PWD-Coaching-Session.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const report = detail?.report?.report;
  const text = (value: string) => (
    <p className={styles.prose}>{plainText(value)}</p>
  );
  const sources = (ids: number[]) => (
    <div className={styles.citations}>
      {ids.map((n) => {
        const s = report?.sources.find((s) => s.id === n);
        return s ? (
          <a key={n} href={s.url} target="_blank" rel="noopener noreferrer">
            [{n}] {s.title}
          </a>
        ) : null;
      })}
    </div>
  );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/training-center/dashboard">
          <Image
            src="/images/training/pwd-logo.png"
            alt="Pacific Wave Digital"
            width={48}
            height={48}
          />
        </Link>
        <span>
          TRAINING CENTRE
          <br />
          <strong>Your coaching library</strong>
        </span>
        <Link href="/training-center/dashboard">My learning →</Link>
      </header>
      <nav>
        <Link href="/training-center/sessions">All sessions</Link>
        {detail && (
          <Link href={`/training-center/course/${detail.session.course_id}`}>
            Back to course
          </Link>
        )}
      </nav>
      {error && (
        <p role="alert">
          {error}{" "}
          <Link href="/training-center/account?mode=signin">Sign in</Link>
        </p>
      )}
      {loading ? (
        <p>Loading your private sessions…</p>
      ) : !id ? (
        <>
          <div className={styles.hero}>
            <p>LEARN · REFLECT · APPLY</p>
            <h1>Every conversation. A next step.</h1>
            <p>
              Your session notes, additional research, source links and branded
              PDFs—all in one place.
            </p>
          </div>
          <div className={styles.grid}>
            {rows.map((s) => (
              <Link
                className={styles.card}
                key={s.id}
                href={`/training-center/sessions?session=${s.id}`}
              >
                <Image
                  src={`/images/coaches/${s.role}.webp`}
                  alt=""
                  width={640}
                  height={360}
                />
                <div>
                  <small>
                    {new Date(s.created_at).toLocaleDateString()} ·{" "}
                    {coaches[s.role].title}
                  </small>
                  <h2>{s.title || coaches[s.role].title}</h2>
                  <p>{s.pwd_lms_courses.title}</p>
                  <span>
                    {s.pwd_lms_coach_reports?.state === "ready"
                      ? "Read report & download PDF →"
                      : s.pwd_lms_coach_reports?.state === "failed"
                        ? "Report needs attention"
                        : "Session details →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {!rows.length && (
            <p>Your finished coaching conversations will appear here.</p>
          )}
          <div className={styles.actions}>
            <button
              disabled={!offset}
              onClick={() => setOffset((n) => Math.max(0, n - 20))}
            >
              Previous
            </button>
            <span>
              {Math.min(offset + 1, total)}–{Math.min(offset + 20, total)} of{" "}
              {total}
            </span>
            <button
              disabled={offset + 20 >= total}
              onClick={() => setOffset((n) => n + 20)}
            >
              Next
            </button>
          </div>
        </>
      ) : detail ? (
        <article className={styles.report}>
          <p className={styles.eyebrow}>
            {detail.session.pwd_lms_courses.title}
          </p>
          <h1>{detail.session.title || coaches[detail.session.role].title}</h1>
          <p>
            {coaches[detail.session.role].title} ·{" "}
            {new Date(detail.session.created_at).toLocaleString()}
          </p>
          <div className={styles.actions}>
            <input
              aria-label="Session name"
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              disabled={busy || !title.trim()}
              onClick={() => void rename()}
            >
              Save name
            </button>
            <button disabled={busy || !report} onClick={() => void download()}>
              Download branded PDF
            </button>
          </div>
          {report ? (
            <>
              <h2>Session summary</h2>
              {text(report.summary)}
              {report.discussion.map((x, i) => (
                <section key={i}>
                  <h2>{x.heading}</h2>
                  {text(x.details)}
                </section>
              ))}
              <h2>Learning opportunities</h2>
              {report.learning_gaps.map((x, i) => (
                <section key={i}>
                  <h3>{x.topic}</h3>
                  {text(x.explanation)}
                </section>
              ))}
              <div className={styles.research}>
                <p className={styles.eyebrow}>BEYOND OUR CONVERSATION</p>
                <h2>Additional research & learning</h2>
                {report.research.length ? (
                  report.research.map((x, i) => (
                    <section key={i}>
                      <h3>{x.heading}</h3>
                      {text(x.details)}
                      {sources(x.source_ids)}
                    </section>
                  ))
                ) : (
                  <p>
                    No additional verified findings are available for this
                    session.
                  </p>
                )}
              </div>
              <h2>Your next steps</h2>
              <ol>
                {report.actions.map((x, i) => (
                  <li key={i}>{plainText(x)}</li>
                ))}
              </ol>
              {report.limitations.length > 0 && (
                <>
                  <h2>What to confirm</h2>
                  {report.limitations.map((x, i) => (
                    <p key={i}>{plainText(x)}</p>
                  ))}
                </>
              )}
              <h2>Sources checked</h2>
              {report.sources.map((s) => (
                <p key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    [{s.id}] {s.title}
                  </a>
                  <br />
                  <small>
                    Checked {new Date(s.checked_at).toLocaleDateString()}
                  </small>
                </p>
              ))}
              <p className={styles.status}>
                {detail.report?.email_state === "sent"
                  ? "Your report email was accepted for delivery to your account email."
                  : detail.report?.email_state === "failed"
                    ? "The report is ready here, but email delivery needs attention."
                    : detail.report?.email_state === "skipped"
                      ? "This report is saved here; no email was sent."
                      : "Your report is ready. Email delivery is being prepared."}
              </p>
            </>
          ) : (
            <div role="status" className={styles.research}>
              <h2>
                {!detail.report && detail.session.state === "ended"
                  ? "Your saved conversation"
                  : detail.report?.state === "failed"
                    ? "Your report needs attention"
                    : "Preparing your learning report"}
              </h2>
              <p>
                {!detail.report && detail.session.state === "ended"
                  ? "This session was saved before researched reports were enabled. You can revisit the original conversation below."
                  : detail.report?.state === "failed"
                    ? "Your conversation is saved. Contact your training team if the report remains unavailable."
                    : "We’re organizing the discussion, researching learning opportunities and checking source links. You can leave this page; the report will appear here and arrive by email when ready."}
              </p>
            </div>
          )}
          {detail.session.state === "ended" && (
            <details>
              <summary>Original conversation</summary>
              {detail.session.transcript?.map((line, i) => (
                <p key={i}>
                  <strong>{line.role === "user" ? "You" : "Coach"}:</strong>{" "}
                  {plainText(line.content)}
                </p>
              ))}
            </details>
          )}
        </article>
      ) : null}
    </div>
  );
}
