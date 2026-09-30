"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { authFetch } from "@/lib/auth-fetch";
import type { Course } from "@/lib/lms/types";
type Instructor = {
  user_id: string;
  email: string;
  full_name: string;
  instructor_title: string;
  expertise: string;
  bio: string;
  avatar_url: string;
  course_ids: string[];
  last_sign_in_at: string | null;
};
async function api(body?: unknown) {
  const r = await authFetch(
    "/api/lms-instructors",
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Request failed");
  return d;
}
function CourseChecks({
  courses,
  selected,
  onChange,
}: {
  courses: Course[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="in-courses">
      {courses.map((c) => (
        <label key={c.id} className="af-check">
          <input
            type="checkbox"
            checked={selected.includes(c.id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, c.id]
                  : selected.filter((id) => id !== c.id),
              )
            }
          />
          <span>{c.title}</span>
        </label>
      ))}
    </div>
  );
}
export default function InstructorAdmin({ courses }: { courses: Course[] }) {
  const [list, setList] = useState<Instructor[] | null>(null),
    [draft, setDraft] = useState<string[]>([]),
    [editing, setEditing] = useState<Instructor | null>(null),
    [editCourses, setEditCourses] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const load = useCallback(async () => setList((await api()).instructors), []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  async function run(body: unknown, done: string) {
    if (busy) return false;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(body);
      await load();
      setMessage(done);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const title = (id: string) => courses.find((c) => c.id === id)?.title || "Course";
  return (
    <>
      {error && <p className="lms-alert" role="alert">{error}</p>}
      {message && <p className="lms-notice" role="status">{message}</p>}
      <section className="lms-panel">
        <h2>Instructors</h2>
        <p>
          Instructors sign in with their normal Training Centre account and
          open the Teaching workspace. They manage lessons, recordings,
          quizzes, grading, announcements, groups and students for their
          assigned courses only. Payments, banks, coupons and affiliates stay
          with admins.
        </p>
        {!list ? (
          <p>Loading instructors…</p>
        ) : list.length ? (
          <div className="in-list">
            {list.map((i) => (
              <article key={i.user_id} className="in-card">
                <div className="in-avatar">
                  {i.avatar_url ? (
                    <Image src={i.avatar_url} alt="" width={56} height={56} unoptimized />
                  ) : (
                    <span>{(i.full_name || i.email).slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="in-body">
                  <strong>{i.full_name || i.email}</strong>
                  <small>
                    {i.instructor_title || "No title yet"} · {i.email}
                  </small>
                  <small className="af-muted">
                    {i.last_sign_in_at
                      ? `Last signed in ${new Date(i.last_sign_in_at).toLocaleDateString()}`
                      : "Has not signed in yet"}
                  </small>
                  <div className="in-tags">
                    {i.course_ids.map((id) => (
                      <span key={id}>{title(id)}</span>
                    ))}
                  </div>
                  {editing?.user_id === i.user_id ? (
                    <fieldset disabled={busy}>
                      <CourseChecks courses={courses} selected={editCourses} onChange={setEditCourses} />
                      <button
                        type="button"
                        className="lms-button"
                        onClick={() =>
                          run(
                            { action: "assign", user_id: i.user_id, course_ids: editCourses },
                            editCourses.length ? "Courses updated." : "Instructor removed from all courses.",
                          ).then((ok) => ok && setEditing(null))
                        }
                      >
                        Save courses
                      </button>{" "}
                      <button type="button" className="lms-text" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </fieldset>
                  ) : (
                    <div className="in-actions">
                      <button
                        type="button"
                        className="lms-text"
                        onClick={() => {
                          setEditing(i);
                          setEditCourses(i.course_ids);
                        }}
                      >
                        Change courses
                      </button>
                      <button
                        type="button"
                        className="lms-text"
                        disabled={busy}
                        onClick={() => run({ action: "resend", user_id: i.user_id }, `Invitation sent to ${i.email}.`)}
                      >
                        Resend invitation
                      </button>
                      <button
                        type="button"
                        className="lms-text"
                        disabled={busy}
                        onClick={() => {
                          if (confirm(`Remove ${i.full_name || i.email} as an instructor from all courses? Their account stays.`))
                            run({ action: "assign", user_id: i.user_id, course_ids: [] }, "Instructor removed.");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No instructors yet. Invite your first instructor below.</p>
        )}
      </section>
      <form
        className="lms-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          if (!draft.length) {
            setError("Choose at least one course.");
            return;
          }
          run(
            {
              action: "invite",
              full_name: f.get("full_name"),
              email: f.get("email"),
              instructor_title: f.get("instructor_title") || "",
              course_ids: draft,
            },
            `Instructor added. An invitation email is on its way to ${f.get("email")}.`,
          ).then((ok) => {
            if (ok) {
              form.reset();
              setDraft([]);
            }
          });
        }}
      >
        <h2>Add an instructor</h2>
        <p>
          Enter their details and choose their courses. If they don&apos;t
          have an account yet, we create one and email them a secure link to
          set their password. Existing accounts keep their password.
        </p>
        <fieldset disabled={busy}>
          <label>
            Full name
            <input name="full_name" required minLength={2} maxLength={120} />
          </label>
          <label>
            Email address
            <input name="email" type="email" required maxLength={254} />
          </label>
          <label>
            Title (optional)
            <input name="instructor_title" maxLength={120} placeholder="e.g. Lead Instructor, Web Development" />
          </label>
          <p><strong>Courses they teach</strong></p>
          <CourseChecks courses={courses} selected={draft} onChange={setDraft} />
          <button className="lms-button">Add instructor & send invitation</button>
        </fieldset>
      </form>
    </>
  );
}
