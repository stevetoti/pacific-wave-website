"use client";
import { useEffect, useState } from "react";
import YouTubeRecordingFields from "./YouTubeRecordingFields";
import { parseYouTubeRecording } from "@/lib/lms/youtube-recordings";
import WorkbookReview from "./WorkbookReview";
import LessonThumbnail from "./LessonThumbnail";
import { blpSlug, blpModules, workshopRecordingPending } from "@/lib/lms/blp-workshop";
import CourseAdministration from "./CourseAdministration";
import QuizBuilder from "./QuizBuilder";
import EmailCampaigns from "./EmailCampaigns";
import CourseCommunity from "./CourseCommunity";
import ChallengeAdmin from "./challenges/ChallengeAdmin";
import AffiliateAdmin from "./AffiliateAdmin";
import InstructorAdmin from "./InstructorAdmin";
import StudentRoster from "./StudentRoster";
import ContactHistory from "./ContactHistory";
import InstructorProfileForm from "./InstructorProfileForm";
import MessagesCenter from "./MessagesCenter";
import NotificationBell from "./NotificationBell";
import MessageReports from "./MessageReports";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";
import {
  money,
  paymentReference,
  type Course,
  type Lesson,
  type Order,
  type Bank,
  type Question,
} from "@/lib/lms/types";
const emptyCourse = {
  slug: "",
  title: "",
  description: "",
  introduction: "",
  kind: "recorded" as const,
  amount: 35000,
  currency: "VUV",
  published: false,
  enrollment_open: true,
};
// Admin tabs grouped by job so the right screen is easy to find.
const adminGroups: [string, string[]][] = [
  ["People", ["students", "history", "instructors", "affiliates", "access"]],
  ["Courses & content", ["courses", "lessons", "grading", "workbooks", "challenges"]],
  ["Communication", ["community", "reports", "campaigns", "emails"]],
  ["Money", ["payments", "coupons", "banks"]],
];
// Instructors get only the teaching tabs, scoped server-side to their assigned courses.
const teachTabs = ["challenges", "workbooks", "lessons", "students", "history", "grading", "community", "messages", "profile"];
const tabLabel: Record<string, string> = {
  payments: "Registrations & payments",
  community: "Course communication",
  students: "Students",
  history: "Contact history",
  profile: "My instructor profile",
  reports: "Message reports",
};
export default function TrainingAdmin({
  initialTab = "students",
  mode = "admin",
}: {
  initialTab?: "students" | "courses" | "payments" | "community" | "affiliates" | "instructors" | "lessons";
  mode?: "admin" | "teach";
}) {
  const teaching = mode === "teach";
  const [tab, setTab] = useState<string>(teaching ? "lessons" : initialTab),
    [courses, setCourses] = useState<Course[]>([]),
    [lessons, setLessons] = useState<Lesson[]>([]),
    [orders, setOrders] = useState<Order[]>([]),
    [banks, setBanks] = useState<Bank[]>([]),
    [selected, setSelected] = useState(""),
    [editCourse, setEditCourse] = useState<Partial<Course>>(emptyCourse),
    [editLesson, setEditLesson] = useState<Partial<Lesson> | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [filter, setFilter] = useState("");
  const [exportCourse, setExportCourse] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [emailLogs, setEmailLogs] = useState<
    {
      id: string;
      email: string;
      purpose: string;
      state: string;
      created_at: string;
    }[]
  >([]);
  async function loadEmailLogs() {
    const r = await authFetch("/api/lms/email_logs");
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    setEmailLogs(d.logs);
  }
  const [questions, setQuestions] = useState<Question[]>([]);
  function chooseLesson(l: Partial<Lesson>) {
    setEditLesson(l);
    setQuestions(l.quiz || []);
  }
  async function load() {
    const r = await authFetch("/api/lms/admin");
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setCourses(d.courses);
    setLessons(d.lessons);
    setOrders(d.orders);
    setBanks(d.banks);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  // An instructor with a single course starts with it selected.
  useEffect(() => {
    if (teaching && courses.length === 1 && !selected) setSelected(courses[0].id);
  }, [teaching, courses, selected]);
  async function save(body: unknown) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await authFetch("/api/lms/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (d.signedUrl) {
        window.location.assign(d.signedUrl);
        return;
      }
      await load();
      if (tab === "emails") await loadEmailLogs();
      setMessage("Saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  const selectedCourse = courses.find(c => c.id === selected);
  const blpWorkshop = selectedCourse?.slug === blpSlug;
  const selectedLessons = lessons.filter(l => l.course_id === selected);
  return (
    <div className="lms">
      <div className="lms-shell">
        <p className="lms-eyebrow">
          {teaching ? "PACIFIC WAVE DIGITAL / TEACHING" : "PACIFIC WAVE DIGITAL / ADMIN"}
        </p>
        <h1>{teaching ? "Teaching workspace" : "Training centre"}</h1>
        <p>
          {teaching
            ? "Manage lessons, recordings, quizzes, grading and conversations for the courses you teach."
            : "Build courses, publish class materials and manage student payments."}
        </p>
        {teaching ? (
          <div className="lms-nav-actions">
            <Link href="/training-center/dashboard">← My dashboard</Link>
            <NotificationBell />
          </div>
        ) : (
          <Link href="/training-center" target="_blank">
            View student experience →
          </Link>
        )}
        {!teaching && (
          <label className="lms-admin-jump">
            Go to
            <select
              value={tab}
              onChange={(e) => {
                setTab(e.target.value);
                if (e.target.value === "emails")
                  loadEmailLogs().catch((err) => setError(err.message));
              }}
            >
              {adminGroups.map(([group, tabs]) => (
                <optgroup key={group} label={group}>
                  {tabs.map((t) => (
                    <option key={t} value={t}>
                      {tabLabel[t] || t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
        <nav className={`lms-admin-tabs ${teaching ? "" : "grouped"}`} aria-label="Training admin sections">
          {(teaching ? [["", teachTabs] as [string, string[]]] : adminGroups).map(([group, tabs]) => (
            <div key={group || "teach"} className="lms-admin-tab-group">
              {group && <span className="lms-admin-tab-label">{group}</span>}
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    if (t === "emails")
                      loadEmailLogs().catch((e) => setError(e.message));
                  }}
                  className={tab === t ? "selected" : ""}
                >
                  {tabLabel[t] || t[0].toUpperCase() + t.slice(1)}
                  {t === "students" && !teaching && orders.some((o) => o.status === "review") && (
                    <span className="lms-tab-dot" aria-label="Payment proofs to check">
                      {orders.filter((o) => o.status === "review").length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
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
        {["access", "coupons", "grading"].includes(tab) && (
          <CourseAdministration courses={courses} section={tab} />
        )}
        {tab === "workbooks" && <WorkbookReview courses={courses} />}
        {tab === "campaigns" && <EmailCampaigns courses={courses} />}
        {tab === "challenges" && <ChallengeAdmin courses={courses} />}
        {tab === "affiliates" && <AffiliateAdmin />}
        {tab === "instructors" && !teaching && <InstructorAdmin courses={courses} />}
        {tab === "profile" && teaching && <InstructorProfileForm />}
        {tab === "messages" && teaching && <div className="student-dashboard-embed"><MessagesCenter /></div>}
        {tab === "reports" && !teaching && <MessageReports />}
        {tab === "students" && !teaching && (
          <StudentRoster orders={orders} courses={courses} busy={busy} save={save} onChanged={load} />
        )}
        {tab === "students" && teaching && (
          <StudentRoster mode="teach" orders={orders} courses={courses} busy={busy} save={save} onChanged={load} />
        )}
        {tab === "history" && <ContactHistory />}
        {tab === "courses" && (
          <div className="lms-two">
            <section className="lms-panel">
              <h2>Course library</h2>
              {courses.map((c) => (
                <button
                  className="lms-lesson"
                  key={c.id}
                  onClick={() => setEditCourse(c)}
                >
                  {c.title}
                  <small>{c.published ? "Published" : "Draft"}</small>
                </button>
              ))}
              <button
                className="lms-button"
                onClick={() => setEditCourse({ ...emptyCourse })}
              >
                Add a course
              </button>
            </section>
            <form
              className="lms-panel"
              key={editCourse.id || "new"}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                save({
                  action: "course",
                  value: {
                    ...(editCourse.id ? { id: editCourse.id } : {}),
                    slug: f.get("slug"),
                    title: f.get("title"),
                    description: f.get("description"),
                    introduction: f.get("introduction"),
                    kind: f.get("kind"),
                    amount: Number(f.get("amount")),
                    currency: f.get("currency"),
                    published: f.get("published") === "on",
                    is_private: f.get("is_private") === "on",
                    requires_approval: f.get("requires_approval") === "on",
                    enrollment_open: f.get("enrollment_open") === "on",
                    coaching_ends_on: f.get("coaching_ends_on") || null,
                  },
                });
              }}
            >
              <h2>{editCourse.id ? "Edit course" : "Create a course"}</h2>
              <fieldset disabled={busy}>
                <label>
                  Course title
                  <input
                    name="title"
                    required
                    defaultValue={editCourse.title}
                  />
                </label>
                <label>
                  URL slug
                  <input
                    name="slug"
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    defaultValue={editCourse.slug}
                  />
                </label>
                <label>
                  AI coaching last day (Vanuatu date)
                  <input type="date" name="coaching_ends_on" defaultValue={editCourse.coaching_ends_on || ""} />
                  <small>Optional override. Otherwise uses the cohort action-period end or the mentorship’s three-month window. Leave blank for ongoing courses without a published end.</small>
                </label>
                <label>
                  Course format
                  <select name="kind" defaultValue={editCourse.kind}>
                    <option value="live">Live cohort</option>
                    <option value="recorded">Recorded course</option>
                  </select>
                </label>
                <label>
                  Short description
                  <textarea
                    name="description"
                    defaultValue={editCourse.description}
                  />
                </label>
                <label>
                  Course introduction
                  <textarea
                    name="introduction"
                    defaultValue={editCourse.introduction}
                  />
                </label>
                <label>
                  Currency
                  <select name="currency" defaultValue={editCourse.currency}>
                    <option>VUV</option>
                    <option>USD</option>
                    <option>AUD</option>
                  </select>
                </label>
                <label>
                  Price in minor units (VUV: vatu; USD/AUD: cents)
                  <input
                    name="amount"
                    type="number"
                    required
                    min="0"
                    defaultValue={editCourse.amount}
                  />
                </label>
                <p className="lms-muted">
                  Example: VUV 35,000 = 35000. USD 100 = 10000. Existing orders
                  keep their original price.
                </p>
                <label className="lms-check">
                  <input
                    name="published"
                    type="checkbox"
                    defaultChecked={editCourse.published}
                  />
                  Publish course (make its registration link available)
                </label>
                <label className="lms-check">
                  <input
                    name="enrollment_open"
                    type="checkbox"
                    defaultChecked={editCourse.enrollment_open}
                  />
                  Accept new enrolments
                </label>
                <label className="lms-check"><input name="is_private" type="checkbox" defaultChecked={editCourse.is_private} />Private workshop — hide from public listings and isolate student messaging</label>
                <p className="lms-muted">A price of 0 means no participant fee. Approval is required for a zero-fee workshop to check participants before granting access. Private-course participants can connect with classmates and their instructors.</p>
                {editCourse.id && editCourse.is_private && <p>Private registration link: <a href={`/training-center/account?mode=signup&course=${editCourse.slug}`}>/training-center/account?mode=signup&amp;course={editCourse.slug}</a></p>}
                <label className="lms-check"><input name="requires_approval" type="checkbox" defaultChecked={editCourse.requires_approval} />Admin approval required before learning and chat access</label>
                <button className="lms-button">Save course</button>
              </fieldset>
            </form>
          </div>
        )}
        {tab === "emails" && (
          <section className="lms-panel">
            <h2>Account email delivery</h2>
            <p>
              Latest 100 account emails. Accepted means the provider received
              it; delivered means the recipient’s mail server accepted it. Check
              spam if it is still missing.
            </p>
            <button
              className="lms-text"
              onClick={() => loadEmailLogs().catch((e) => setError(e.message))}
            >
              Refresh email list
            </button>
            {emailLogs.map((log) => (
              <article className="lms-bank" key={log.id}>
                <strong>{log.email}</strong>
                <p>
                  {log.purpose} · {log.state} ·{" "}
                  {new Date(log.created_at).toLocaleString()}
                </p>
                <button
                  className="lms-text"
                  disabled={busy}
                  onClick={() => save({ action: "email_status", id: log.id })}
                >
                  Check delivery status
                </button>
              </article>
            ))}
          </section>
        )}
        {tab === "community" && (
          <>
            <h2>Course communication</h2>
            <p>
              Select a course to chat with students, share announcements, tag
              participants and manage private groups.
            </p>
            <label>
              Choose a course
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            {selected && <CourseCommunity key={selected} courseId={selected} />}
          </>
        )}
        {tab === "lessons" && (
          <>
            <label>
              Choose a course
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setEditLesson(null);
                }}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            {blpWorkshop && <section className="lms-bank" aria-label="BLP recording upload guide">
              <h2>BLP session recordings</h2>
              <p><strong>{selectedLessons.filter(l => l.published && !workshopRecordingPending(selectedCourse!, l)).length} of {selectedLessons.length} session recordings available</strong></p>
              <ol>
                <li>Select the matching session below. Its title, date, time and lesson notes are already prepared.</li>
                <li>Upload the session video in the Class recording section: MP4 or WebM, up to 500 MB. Compress or split larger recordings.</li>
                <li>Keep Student enrolment set to Shared course lesson so every approved BLP participant can watch.</li>
                <li>Keep Publish lesson materials checked and click Save lesson. Uploading alone does not attach the video.</li>
              </ol>
              <p>Topics without recordings stay as locked previews. Saving a recording to a published session replaces its preview with playback for approved participants only.</p>
            </section>}
            {selected && (
              <div className="lms-two">
                <section className="lms-panel">
                  <h2>Lessons & calendar</h2>
                  {lessons
                    .filter((l) => l.course_id === selected)
                    .map((l) => (
                      <button
                        className="lms-lesson lms-lesson-with-image"
                        disabled={busy}
                        key={l.id}
                        onClick={() => chooseLesson(l)}
                      >
                        <LessonThumbnail url={l.thumbnail_url || (blpWorkshop && blpModules[l.position - 1] ? `/images/training/blp/scene-0${blpModules[l.position - 1].image}.webp` : undefined)} />
                        <span className="lms-lesson-copy">
                          {l.section_title && <small>{l.section_title}</small>}
                          {l.position}. {l.title}
                          <small>
                            {l.order_id
                              ? `${orders.find((o) => o.id === l.order_id)?.email || "Assigned student"} · `
                              : ""}
                            {blpWorkshop ? workshopRecordingPending(selectedCourse!, l) ? "Awaiting recording · Student preview locked" : l.published ? "Recording available to participants" : "Recording attached · Draft" : l.published ? "Published" : "Draft"}
                            {blpWorkshop && l.starts_at && <span>{new Date(l.starts_at).toLocaleString("en-GB", {timeZone:"Pacific/Efate",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})} · Vanuatu time</span>}
                          </small>
                        </span>
                      </button>
                    ))}
                  <button
                    className="lms-button"
                    onClick={() =>
                      chooseLesson({
                        course_id: selected,
                        title: "",
                        position:
                          lessons.filter((l) => l.course_id === selected)
                            .length + 1,
                        content: "",
                        youtube_id: "",
                        meeting_url: "",
                        published: false,
                        starts_at: null,
                        quiz: [],
                      })
                    }
                  >
                    Add lesson
                  </button>
                </section>
                {editLesson && (
                  <form
                    className="lms-panel"
                    key={editLesson.id || "new"}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const quiz = questions;
                      const links = f.getAll("youtube_links").map(String).map(value => value.trim()).filter(Boolean);
                      const ids = links.map(parseYouTubeRecording);
                      if (ids.some(id => !id)) {
                        setError("Please enter a valid YouTube video link or 11-character video ID for each recording.");
                        return;
                      }
                      const youtubeIds = Array.from(new Set(ids.filter((id): id is string => id !== null)));
                      save({
                        action: "lesson",
                        value: {
                          ...(editLesson.id ? { id: editLesson.id } : {}),
                          course_id: selected,
                          order_id: f.get("order_id") || null,
                          recording_path: editLesson.recording_path || "",
                          thumbnail_path: editLesson.thumbnail_path || "",
                          title: f.get("title"),
                          position: Number(f.get("position")),
                          starts_at: f.get("starts_at")
                            ? `${f.get("starts_at")}:00+11:00`
                            : null,
                          content: f.get("content"),
                          youtube_id: youtubeIds[0] || "",
                          youtube_ids: youtubeIds,
                          meeting_url: f.get("meeting_url"),
                          zoom_passcode: f.get("zoom_passcode"),
                          published: f.get("published") === "on",
                          quiz,
                          section_title: f.get("section_title"),
                          quiz_settings: editLesson.quiz_settings || {
                            pass_mark: 70,
                            max_attempts: 0,
                            time_limit_minutes: 0,
                          },
                        },
                      });
                    }}
                  >
                    <h2>{blpWorkshop ? `Session ${editLesson.position}: ${editLesson.title}` : "Lesson editor"}</h2>
                    <section className="lms-bank">
                      <h3>Lesson thumbnail</h3>
                      <p>
                        Upload a JPG, PNG or WebP image (up to 3 MB). A
                        landscape image works best; we crop it to 16:9 and
                        optimise it for fast loading.
                      </p>
                      {editLesson.thumbnail_url && (
                        <LessonThumbnail url={editLesson.thumbnail_url} cover />
                      )}
                      <label>
                        Upload lesson thumbnail
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={busy}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const input = e.currentTarget;
                            setBusy(true);
                            setError("");
                            setMessage("");
                            try {
                              if (file.size > 3145728)
                                throw Error(
                                  "Choose an image smaller than 3 MB.",
                                );
                              const r = await authFetch(
                                `/api/lms-thumbnails?course=${selected}`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": file.type },
                                  body: file,
                                },
                              );
                              const data = await r.json();
                              if (!r.ok) throw Error(data.error);
                              setEditLesson((current) =>
                                current?.course_id === editLesson.course_id &&
                                current?.id === editLesson.id
                                  ? {
                                      ...current,
                                      thumbnail_path: data.path,
                                      thumbnail_url: data.url,
                                    }
                                  : current,
                              );
                              setMessage(
                                "Thumbnail uploaded. Save the lesson to keep it.",
                              );
                            } catch (e) {
                              setError(
                                e instanceof Error
                                  ? e.message
                                  : "Upload failed",
                              );
                            } finally {
                              setBusy(false);
                              input.value = "";
                            }
                          }}
                        />
                      </label>
                      {editLesson.thumbnail_path && (
                        <button
                          type="button"
                          disabled={busy}
                          className="lms-text"
                          onClick={() =>
                            setEditLesson({
                              ...editLesson,
                              thumbnail_path: "",
                              thumbnail_url: "",
                            })
                          }
                        >
                          Remove thumbnail
                        </button>
                      )}
                      <p className="lms-muted">
                        Draft lessons stay unpublished until you tick Publish
                        lesson materials and save.
                      </p>
                    </section>
                    {editLesson.id && (
                      <button
                        type="button"
                        className="lms-text"
                        onClick={() =>
                          chooseLesson({
                            ...editLesson,
                            id: undefined,
                            title: `${editLesson.title} (copy)`,
                            position: (editLesson.position || 0) + 1,
                            published: false,
                            recording_path: "",
                          })
                        }
                      >
                        Duplicate as a draft
                      </button>
                    )}
                    <label>
                      Module / section title
                      <input
                        name="section_title"
                        maxLength={160}
                        defaultValue={editLesson.section_title || ""}
                        placeholder="Module 1 · Business foundations"
                      />
                    </label>
                    <label>
                      Student enrolment{" "}
                      {courses.find((c) => c.id === selected)?.private_sessions
                        ? "(required for private mentorship)"
                        : "(optional)"}
                      <select
                        name="order_id"
                        required={
                          courses.find((c) => c.id === selected)
                            ?.private_sessions
                        }
                        value={editLesson.order_id || ""}
                        onChange={(e) =>
                          setEditLesson({
                            ...editLesson,
                            order_id: e.target.value || null,
                            recording_path: "",
                          })
                        }
                      >
                        <option value="">Shared course lesson</option>
                        {orders
                          .filter((o) => o.course_id === selected)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} · {o.email} · {o.status}
                            </option>
                          ))}
                      </select>
                    </label>
                    {(editLesson.order_id || !courses.find(c=>c.id===selected)?.private_sessions) && (
                      <div className="lms-bank">
                        <h3>{editLesson.order_id ? "Private session recording" : "Class recording"}</h3>
                        <p>
                          Upload MP4 or WebM (up to 500 MB). Playback is restricted to the enrolled student or course members. Save the lesson and publish it when ready.
                        </p>
                        <input
                          aria-label="Upload class recording"
                          type="file"
                          accept="video/mp4,video/webm"
                          disabled={busy}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setBusy(true);
                            setError("");
                            try {
                              if (file.size > 524288000)
                                throw new Error(
                                  "Recording must be 500 MB or smaller. Compress or split longer sessions.",
                                );
                              const extension = file.name
                                .toLowerCase()
                                .endsWith(".webm")
                                ? "webm"
                                : "mp4";
                              if (
                                !["video/mp4", "video/webm"].includes(file.type)
                              )
                                throw new Error("Choose an MP4 or WebM video.");
                              const r = await authFetch("/api/lms/admin", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "recording_upload",
                                  order_id: editLesson.order_id || null,
                                  course_id: selected,
                                  extension,
                                }),
                              });
                              const d = await r.json();
                              if (!r.ok) throw new Error(d.error);
                              const upload = await supabase.storage
                                .from("pwd-mentorship-recordings")
                                .uploadToSignedUrl(d.path, d.token, file, {
                                  contentType: file.type,
                                });
                              if (upload.error) throw upload.error;
                              setEditLesson({
                                ...editLesson,
                                recording_path: d.path,
                              });
                              setMessage(
                                "Recording uploaded privately. Save the lesson to attach it.",
                              );
                            } catch (e) {
                              setError(
                                e instanceof Error
                                  ? e.message
                                  : "Upload failed",
                              );
                            } finally {
                              setBusy(false);
                            }
                          }}
                        />
                        {editLesson.recording_path && (
                          <p>
                            Private recording attached.{" "}
                            <button
                              type="button"
                              className="lms-text"
                              onClick={() =>
                                setEditLesson({
                                  ...editLesson,
                                  recording_path: "",
                                })
                              }
                            >
                              Detach recording
                            </button>
                          </p>
                        )}
                      </div>
                    )}

                    <fieldset disabled={busy}>
                      <label>
                        Title
                        <input
                          required
                          name="title"
                          defaultValue={editLesson.title}
                        />
                      </label>
                      <label>
                        Position
                        <input
                          name="position"
                          type="number"
                          min="0"
                          defaultValue={editLesson.position}
                        />
                      </label>
                      <label>
                        Live class date & time (Vanuatu UTC+11)
                        <input
                          type="datetime-local"
                          name="starts_at"
                          defaultValue={
                            editLesson.starts_at
                              ? new Date(
                                  Date.parse(editLesson.starts_at) +
                                    11 * 3600000,
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                        />
                      </label>
                      <label>
                        Introduction / lesson notes
                        <textarea
                          name="content"
                          defaultValue={editLesson.content}
                        />
                      </label>
                      {courses.find(c => c.id === selected)?.private_sessions
                        ? <p className="lms-muted">Mentorship uses the private recording upload above.</p>
                        : <YouTubeRecordingFields key={editLesson.id || "new"} lesson={editLesson} />}
                      <label>
                        Live meeting URL
                        <input
                          type="url"
                          name="meeting_url"
                          placeholder="https://…"
                          defaultValue={editLesson.meeting_url}
                        />
                      </label>
                      <label>
                        Zoom meeting passcode (for the embedded classroom)
                        <input name="zoom_passcode" autoComplete="off" maxLength={100} defaultValue={editLesson.zoom_passcode || ""} />
                      </label>
                      <p className="lms-muted">For Zoom, paste the standard meeting invitation URL above and its actual passcode here (not the encrypted pwd value in the link). Use a meeting hosted by the connected PWD Zoom account. Start the class in your Zoom desktop app. Publish the lesson to let approved students join; recordings can be added afterwards.</p>
                      <QuizBuilder
                        questions={questions}
                        onChange={setQuestions}
                        settings={
                          editLesson.quiz_settings || {
                            pass_mark: 70,
                            max_attempts: 0,
                            time_limit_minutes: 0,
                          }
                        }
                        onSettings={(settings) =>
                          setEditLesson({
                            ...editLesson,
                            quiz_settings: settings,
                          })
                        }
                      />
                      <label className="lms-check">
                        <input
                          type="checkbox"
                          name="published"
                          defaultChecked={editLesson.published}
                        />
                        {blpWorkshop ? "Publish lesson materials for approved participants" : "Publish lesson materials for paid students"}
                      </label>
                      <button className="lms-button">Save lesson</button>
                    </fieldset>
                  </form>
                )}
              </div>
            )}
          </>
        )}
        {tab === "payments" && (
          <>
            <h2>Student registrations & payments</h2>
            <p>
              All course registrations appear here. “Review” means bank proof
              has been uploaded and is waiting for you to check the deposit and
              approve it.
            </p>
            <button
              className="lms-text"
              disabled={busy}
              onClick={() => load().catch((e) => setError(e.message))}
            >
              Refresh registrations
            </button>
            <label>
              Search by name, email, phone or payment reference
              <input
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="e.g. PWD-1A2B3C4D or Mary"
              />
            </label>
            <label>
              Payment status
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All payments</option>
                {[
                  "review",
                  "pending",
                  "paid",
                  "rejected",
                  "refunded",
                  "granted",
                  "revoked",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Course
              <select
                value={exportCourse}
                onChange={(e) => setExportCourse(e.target.value)}
              >
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="lms-button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const response = await authFetch(
                    `/api/lms/students_export?${new URLSearchParams({ course: exportCourse, status: filter })}`,
                  );
                  if (!response.ok) {
                    const result = await response.json();
                    throw Error(result.error || "Export failed");
                  }
                  const url = URL.createObjectURL(await response.blob());
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "training-course-registrations.csv";
                  link.click();
                  URL.revokeObjectURL(url);
                  setMessage(
                    "Registration export downloaded. Import the CSV into your CRM.",
                  );
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Export failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Export registrations CSV
            </button>
            <p>
              Export includes names, emails, phone numbers, courses and payment
              details for all matching registrations. Select All payments to
              include every status. One row per course registration; no private
              student bios or photos are exported.
            </p>
            <button
              className="lms-text"
              disabled={busy}
              onClick={() => save({ action: "retry_emails" })}
            >
              Retry pending registration emails
            </button>
            <p>
              Latest 500 orders. Verify the deposit in your bank account before
              approving proof.
            </p>
            <div className="lms-grid">
              {orders
                .filter(
                  (o) =>
                    (!filter || o.status === filter) &&
                    (!exportCourse || o.course_id === exportCourse) &&
                    (!paymentSearch.trim() ||
                      [o.name, o.email, o.phone, paymentReference(o.id), o.id]
                        .join(" ")
                        .toLowerCase()
                        .includes(paymentSearch.trim().toLowerCase())),
                )
                .map((o) => (
                  <article className="lms-panel" key={o.id}>
                    <span className="lms-pill">{o.status}</span>
                    <h2>{o.name}</h2>
                    <p>
                      {o.email}
                      <br />
                      {o.phone}
                      <br />
                      {courses.find((c) => c.id === o.course_id)?.title}
                    </p>
                    <strong>
                      {money(o.amount, o.currency)} ·{" "}
                      {o.bank || o.method || "No payment yet"}
                    </strong>
                    <p className="lms-muted">
                      Payment reference: <strong>{paymentReference(o.id)}</strong>
                      <br />
                      Registration ID: {o.id}
                      <br />
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                    {o.proof_path && (
                      <button
                        className="lms-text"
                        disabled={busy}
                        onClick={() => save({ action: "proof", id: o.id })}
                      >
                        Download private payment proof
                      </button>
                    )}
                    {o.status === "review" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          save({
                            action: "review",
                            id: o.id,
                            status: f.get("status"),
                            note: f.get("note"),
                          });
                        }}
                      >
                        <fieldset disabled={busy}>
                          <label>
                            Review decision
                            <select name="status">
                              <option value="paid">
                                Deposit verified — approve access
                              </option>
                              <option value="rejected">
                                Needs correction — request new proof
                              </option>
                            </select>
                          </label>
                          <label>
                            Note for student
                            <textarea name="note" maxLength={1000} />
                          </label>
                          <button className="lms-button">
                            Save payment decision
                          </button>
                        </fieldset>
                      </form>
                    )}
                    {o.review_note && <p>{o.review_note}</p>}
                  </article>
                ))}
            </div>
          </>
        )}
        {tab === "banks" && (
          <form
            className="lms-panel"
            key={JSON.stringify(banks)}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              save({
                action: "banks",
                value: ["ANZ", "BRED"]
                  .filter((b) => f.get(`${b}_enabled`) === "on")
                  .map((bank) => ({
                    bank,
                    account_name: f.get(`${bank}_name`),
                    account_number: f.get(`${bank}_number`),
                    branch: f.get(`${bank}_branch`),
                    swift_code: f.get(`${bank}_swift`),
                    bank_address: f.get(`${bank}_address`),
                    currency: f.get(`${bank}_currency`),
                  })),
              });
            }}
          >
            <h2>Bank transfer instructions</h2>
            <p>
              Enabled accounts appear at checkout. Check account numbers
              carefully before saving.
            </p>
            <fieldset disabled={busy}>
              <div className="lms-grid">
                {["ANZ", "BRED"].map((bank) => {
                  const b = banks.find((b) => b.bank === bank);
                  return (
                    <section key={bank}>
                      <h3>{bank}</h3>
                      <label className="lms-check">
                        <input
                          type="checkbox"
                          name={`${bank}_enabled`}
                          defaultChecked={!!b}
                        />
                        Enable {bank}
                      </label>
                      <label>
                        Account name
                        <input
                          name={`${bank}_name`}
                          defaultValue={b?.account_name}
                        />
                      </label>
                      <label>
                        Account number
                        <input
                          name={`${bank}_number`}
                          defaultValue={b?.account_number}
                        />
                      </label>
                      <label>
                        Branch
                        <input
                          name={`${bank}_branch`}
                          defaultValue={b?.branch}
                        />
                      </label>
                      <label>
                        SWIFT code
                        <input
                          name={`${bank}_swift`}
                          defaultValue={b?.swift_code}
                        />
                      </label>
                      <label>
                        Bank address
                        <input
                          name={`${bank}_address`}
                          defaultValue={b?.bank_address}
                        />
                      </label>
                      <label>
                        Currency
                        <select
                          name={`${bank}_currency`}
                          defaultValue={b?.currency || "VUV"}
                        >
                          <option>VUV</option>
                          <option>USD</option>
                          <option>AUD</option>
                        </select>
                      </label>
                    </section>
                  );
                })}
              </div>
              <button className="lms-button">Save bank accounts</button>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}
