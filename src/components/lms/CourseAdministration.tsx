"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { money, type Course, type Question } from "@/lib/lms/types";
type Coupon = {
  id?: string;
  code: string;
  course_id: string;
  kind: string;
  currency?: string;
  value: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number;
  per_student: number;
  email: string | null;
  pwd_lms_coupon_uses?: { count: number }[];
};
type Grant = {
  id: string;
  email: string;
  course_id: string;
  status: string;
  package_label: string;
};
type Attempt = {
  id: string;
  user_id: string;
  student_email: string;
  student_name: string;
  questions: Question[];
  answers: unknown[];
  pwd_lms_lessons: { title: string };
  submitted_at: string;
};
export default function CourseAdministration({
  courses,
  section,
}: {
  courses: Course[];
  section: string;
}) {
  const [coupons, setCoupons] = useState<Coupon[]>([]),
    [grants, setGrants] = useState<Grant[]>([]),
    [attempts, setAttempts] = useState<Attempt[]>([]),
    [edit, setEdit] = useState<Coupon | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function load() {
    const r = await authFetch("/api/lms-manage"),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    setCoupons(d.coupons);
    setGrants(d.grants);
    setAttempts(d.attempts);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function save(body: unknown) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await authFetch("/api/lms-manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
      setMessage("Saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  const name = (id: string) =>
    courses.find((c) => c.id === id)?.title || "Course";
  return (
    <section>
      {error && (
        <p className="lms-alert" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="lms-notice" role="status">
          {message}
        </p>
      )}
      {section === "access" && (
        <>
          <div className="lms-two">
            <form
              className="lms-panel"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save({
                  action: "grant",
                  email: f.get("email"),
                  label: f.get("label"),
                  course_ids: f.getAll("courses"),
                });
              }}
            >
              <h2>Grant course access</h2>
              <p>
                Give a verified student access to one or more courses included
                in their package. This records a manual grant, with no payment
                collected.
              </p>
              <fieldset disabled={busy}>
                <label>
                  Student account email
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="student@example.com"
                  />
                </label>
                <label>
                  Package or reason
                  <input
                    name="label"
                    required
                    minLength={3}
                    maxLength={300}
                    placeholder="Business launch package / scholarship"
                  />
                </label>
                <h3>Included courses</h3>
                {courses.map((c) => (
                  <label className="lms-check" key={c.id}>
                    <input type="checkbox" name="courses" value={c.id} />
                    {c.title}
                  </label>
                ))}
                <button className="lms-button">Grant selected courses</button>
              </fieldset>
            </form>
            <aside className="lms-panel">
              <h2>How package access works</h2>
              <ol>
                <li>The student creates and verifies a training account.</li>
                <li>
                  Enter their email and select the courses in their package.
                </li>
                <li>
                  They receive an access email and can open published lessons
                  from My learning.
                </li>
              </ol>
              <p>
                Existing paid enrolments remain valid. Resolve pending card
                payments or bank reviews before granting those courses. Private
                mentorship materials remain assigned to the individual student.
              </p>
            </aside>
          </div>
          <h2>Manual access history</h2>
          <p>Latest 500 grants.</p>
          {grants.length ? (
            grants.map((g) => (
              <article className="lms-panel" key={g.id}>
                <h3>{g.email}</h3>
                <p>
                  {name(g.course_id)} · {g.package_label} · {g.status}
                </p>
                {g.status === "granted" && (
                  <button
                    disabled={busy}
                    className="lms-text"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove manual access to ${name(g.course_id)} for ${g.email}?`,
                        )
                      )
                        save({ action: "revoke", id: g.id });
                    }}
                  >
                    Revoke manual access
                  </button>
                )}
              </article>
            ))
          ) : (
            <p>No manual grants yet.</p>
          )}
        </>
      )}
      {section === "coupons" && (
        <div className="lms-two">
          <section className="lms-panel">
            <h2>Course coupons</h2>
            <p>
              Offer percentage, fixed-amount or full-fee discounts. Codes are
              allocated when applied to a registration, including registrations
              awaiting payment. One coupon per registration.
            </p>
            <button
              className="lms-button"
              onClick={() =>
                setEdit({
                  code: "",
                  course_id: courses[0]?.id || "",
                  kind: "percent",
                  value: 10,
                  active: true,
                  starts_at: null,
                  ends_at: null,
                  max_uses: 100,
                  per_student: 1,
                  email: null,
                })
              }
            >
              Create coupon
            </button>
            {coupons.map((c) => (
              <button
                className="lms-lesson coupon-card"
                key={c.id}
                onClick={() => setEdit(c)}
              >
                <strong>
                  {c.code} · {c.active ? "Active" : "Disabled"}
                </strong>
                <span>{name(c.course_id)}</span>
                <small>
                  {c.kind === "free"
                    ? "Full fee waiver"
                    : c.kind === "percent"
                      ? `${c.value}% off`
                      : money(
                          c.value,
                          c.currency ||
                            courses.find((x) => x.id === c.course_id)
                              ?.currency ||
                            "VUV",
                        ) + " off"}{" "}
                  · {c.pwd_lms_coupon_uses?.[0]?.count || 0}/{c.max_uses}{" "}
                  allocated
                </small>
              </button>
            ))}
          </section>
          {edit && (
            <form
              key={edit.id || "new"}
              className="lms-panel"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save({
                  action: "coupon",
                  value: {
                    ...(edit.id ? { id: edit.id } : {}),
                    code: f.get("code"),
                    course_id: f.get("course"),
                    kind: edit.kind,
                    value: edit.kind === "free" ? 100 : Number(f.get("value")),
                    active: f.get("active") === "on",
                    starts_at: f.get("starts")
                      ? new Date(String(f.get("starts"))).toISOString()
                      : null,
                    ends_at: f.get("ends")
                      ? new Date(String(f.get("ends"))).toISOString()
                      : null,
                    max_uses: Number(f.get("limit")),
                    per_student: 1,
                    email: f.get("email") || null,
                  },
                });
              }}
            >
              <h2>{edit.id ? "Edit coupon" : "New coupon"}</h2>
              <fieldset disabled={busy}>
                <label>
                  Code
                  <input
                    name="code"
                    required
                    pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,39}"
                    defaultValue={edit.code}
                  />
                </label>
                <label>
                  Course
                  <select name="course" defaultValue={edit.course_id}>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.currency})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Discount type
                  <select
                    value={edit.kind}
                    onChange={(e) => setEdit({ ...edit, kind: e.target.value })}
                  >
                    <option value="percent">Percentage discount</option>
                    <option value="fixed">Fixed amount discount</option>
                    <option value="free">Full fee waiver</option>
                  </select>
                </label>
                {edit.kind !== "free" && (
                  <label>
                    {edit.kind === "percent"
                      ? "Percentage (1–100)"
                      : "Discount in course currency minor units (VUV: whole vatu; USD/AUD: cents)"}
                    <input
                      required
                      type="number"
                      name="value"
                      min="1"
                      max={edit.kind === "percent" ? 100 : 100000000}
                      defaultValue={edit.value}
                    />
                  </label>
                )}
                <label>
                  Maximum registrations
                  <input
                    required
                    name="limit"
                    type="number"
                    min="1"
                    max="100000"
                    defaultValue={edit.max_uses}
                  />
                </label>
                <label>
                  Restricted student email (optional)
                  <input
                    name="email"
                    type="email"
                    defaultValue={edit.email || ""}
                  />
                </label>
                <label>
                  Starts (your local time)
                  <input
                    name="starts"
                    type="datetime-local"
                    defaultValue={
                      edit.starts_at ? localDate(edit.starts_at) : ""
                    }
                  />
                </label>
                <label>
                  Expires (your local time)
                  <input
                    name="ends"
                    type="datetime-local"
                    defaultValue={edit.ends_at ? localDate(edit.ends_at) : ""}
                  />
                </label>
                <label className="lms-check">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={edit.active}
                  />
                  Code is active
                </label>
                <button className="lms-button">Save coupon</button>
              </fieldset>
            </form>
          )}
        </div>
      )}
      {section === "grading" && (
        <>
          <h2>Instructor grading</h2>
          <p>
            Review written answers and award points. Other question types are
            marked automatically. Up to 100 submissions are shown, oldest first.
          </p>
          {attempts.length ? (
            attempts.map((a) => (
              <form
                className="lms-panel"
                key={a.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  save({
                    action: "grade",
                    id: a.id,
                    marks: f.getAll("marks").map(Number),
                    feedback: f.get("feedback"),
                  });
                }}
              >
                <h3>{a.pwd_lms_lessons.title}</h3>
                <p>
                  Student: {a.student_name} · {a.student_email} · Submitted{" "}
                  {new Date(a.submitted_at).toLocaleString()}
                </p>
                <fieldset disabled={busy}>
                  {a.questions.map(
                    (q, i) =>
                      q.type === "essay" && (
                        <article className="lms-bank" key={i}>
                          <h4>{q.question}</h4>
                          <p style={{ whiteSpace: "pre-wrap" }}>
                            {String(a.answers[i])}
                          </p>
                          {q.explanation && (
                            <p>Marking guide: {q.explanation}</p>
                          )}
                          <label>
                            Points awarded (maximum {q.points})
                            <input
                              name="marks"
                              required
                              type="number"
                              min="0"
                              max={q.points}
                              step="0.5"
                            />
                          </label>
                        </article>
                      ),
                  )}
                  <label>
                    Feedback to student
                    <textarea required name="feedback" maxLength={4000} />
                  </label>
                  <button className="lms-button">
                    Save grade and feedback
                  </button>
                </fieldset>
              </form>
            ))
          ) : (
            <div className="lms-panel">
              You’re up to date. No written answers await grading.
            </div>
          )}
        </>
      )}
    </section>
  );
}
function localDate(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
