"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  UserRound,
  CalendarDays,
  ReceiptText,
  MessageCircle,
  Settings,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Camera,
  Target,
  Clock3,
  LifeBuoy,
  RefreshCw,
  ClipboardCheck,
  Download,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { supabase } from "@/lib/supabase";
import { money, type Course, type Order, type Progress } from "@/lib/lms/types";
import {
  emptyProfile,
  profileCompletion,
  type StudentProfile,
  type LessonSummary,
} from "@/lib/lms/profile";
import { programs } from "@/lib/lms/programs";
const base = "/training-center";
const sections = [
  ["overview", "Dashboard", LayoutDashboard],
  ["courses", "My courses", BookOpen],
  ["schedule", "My schedule", CalendarDays],
  ["quizzes", "Quiz results", ClipboardCheck],
  ["purchases", "Purchase history", ReceiptText],
  ["community", "Community & groups", MessageCircle],
  ["profile", "My profile", UserRound],
  ["settings", "Account settings", Settings],
] as const;
const statusLabel = (s: string) =>
  ({
    paid: "Enrolled",
    granted: "Package access",
    revoked: "Access removed",
    review: "Payment in review",
    pending: "Payment pending",
    rejected: "Payment needs attention",
    refunded: "Refunded",
  })[s] || s;
async function profileApi(body?: unknown, action?: string) {
  const r = await authFetch(
    "/api/lms-profile" + (action ? "?action=" + action : ""),
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Unable to load your profile.");
  return d;
}
export default function StudentDashboard({
  email,
  orders,
  progress,
  courses: catalog,
  section: requestedSection,
  onRefresh,
}: {
  email: string;
  orders: Order[];
  progress: Progress[];
  courses: Course[];
  section?: string;
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();
  const [asOf, setAsOf] = useState(0);
  const section = sections.some((s) => s[0] === requestedSection)
    ? requestedSection!
    : "overview";
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile),
    [draft, setDraft] = useState<StudentProfile>(emptyProfile),
    [courses, setCourses] = useState<Course[]>(catalog),
    [lessons, setLessons] = useState<LessonSummary[]>([]),
    [joined, setJoined] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [filter, setFilter] = useState("all");
  const load = useCallback(async () => {
    const d = await profileApi();
    setProfile(d.profile);
    setDraft(d.profile);
    setCourses(d.courses);
    setLessons(d.lessons);
    setJoined(d.joined_at);
    setAsOf(Date.now());
  }, []);
  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const name = profile.full_name || "Your student profile",
    first = profile.full_name.trim().split(" ")[0] || "learner",
    completion = profileCompletion(profile);
  const myCourse = (id: string) =>
    courses.find((c) => c.id === id) || catalog.find((c) => c.id === id);
  const mine = orders.filter((o) => o.status !== "refunded"),
    paid = orders.filter((o) => ["paid", "granted"].includes(o.status));
  const validProgress = progress.filter((p) =>
    lessons.some((l) => l.id === p.lesson_id),
  );
  const completed = (id: string) =>
    validProgress.filter((p) =>
      lessons.some((l) => l.id === p.lesson_id && l.course_id === id),
    ).length;
  const quizzes = validProgress.filter((p) => p.score !== null);
  const upcoming = lessons
    .filter(
      (l) =>
        l.starts_at &&
        Date.parse(l.starts_at) >= asOf &&
        mine.some((o) => o.course_id === l.course_id),
    )
    .sort((a, b) => Date.parse(a.starts_at!) - Date.parse(b.starts_at!));
  const courseLink = (id: string) => `${base}/course/${id}`;
  const date = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: profile.timezone,
    });
  const time = (value: string) =>
    new Date(value).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: profile.timezone,
    });
  function downloadHistory() {
    const rows = [
      [
        "Date",
        "Course",
        "Reference",
        "Amount",
        "Currency",
        "Status",
        "Payment method",
      ],
      ...orders.map((o) => [
        date(o.created_at),
        myCourse(o.course_id)?.title || "Course",
        o.id,
        String(o.amount / (o.currency === "VUV" ? 1 : 100)),
        o.currency,
        statusLabel(o.status),
        o.bank || o.method || "Not selected",
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map(
            (v) =>
              '"' +
              (/^[=+@-]/.test(v) ? "'" : "") +
              v.replace(/"/g, '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-training-purchases.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function calendar() {
    const stamp = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const text = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Pacific Wave Digital//Student schedule//EN",
      ...upcoming.flatMap((l) => [
        "BEGIN:VEVENT",
        `UID:${l.id}@pacificwavedigital.com`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(new Date(l.starts_at!))}`,
        `SUMMARY:${l.title.replace(/[\r\n,;]/g, " ")}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/calendar" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-training-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  }
  function avatar(size = 72) {
    return profile.avatar_url ? (
      <Image
        src={profile.avatar_url}
        width={size}
        height={size}
        alt="Your profile photo"
        unoptimized
        className="sd-avatar"
      />
    ) : (
      <span
        className="sd-avatar sd-initials"
        style={{ width: size, height: size }}
      >
        {profile.full_name ? (
          profile.full_name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        ) : (
          <UserRound size={size / 2} />
        )}
      </span>
    );
  }
  function empty(title: string, body: string, link = true) {
    return (
      <div className="sd-empty">
        <GraduationCap size={38} />
        <h3>{title}</h3>
        <p>{body}</p>
        {link && (
          <Link className="lms-button" href={base}>
            Explore courses <ArrowRight size={17} />
          </Link>
        )}
      </div>
    );
  }
  function courseCards(items: Order[]) {
    return (
      <div className="sd-course-grid">
        {items.map((o) => {
          const c = myCourse(o.course_id),
            total = lessons.filter((l) => l.course_id === o.course_id).length,
            done = completed(o.course_id),
            pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <article className="sd-course" key={o.id}>
              <div className="sd-course-photo">
                <Image
                  src={
                    programs[c?.slug || ""]?.image ||
                    "/images/training/hero.webp"
                  }
                  alt={programs[c?.slug || ""]?.alt || "Your training course"}
                  fill
                  sizes="(max-width:700px) 100vw, 400px"
                />
                <span className="sd-status" data-status={o.status}>
                  {statusLabel(o.status)}
                </span>
              </div>
              <div className="sd-course-body">
                <span className="sd-kicker">
                  {c?.private_sessions
                    ? "PERSONAL MENTORSHIP"
                    : c?.kind === "live"
                      ? "LIVE TRAINING"
                      : "RECORDED COURSE"}
                </span>
                <h3>{c?.title || "Your course"}</h3>
                <div className="sd-progress-label">
                  <span>
                    {done} / {total} lessons
                  </span>
                  <strong>{pct}%</strong>
                </div>
                <progress
                  aria-label={`${c?.title || "Course"} progress`}
                  max={100}
                  value={pct}
                />
                <Link className="sd-course-link" href={courseLink(o.course_id)}>
                  {["paid", "granted"].includes(o.status)
                    ? "Continue learning"
                    : "View course introduction"}{" "}
                  <ArrowRight size={17} />
                </Link>
                {!["paid", "granted"].includes(o.status || "") && (
                  <Link
                    className="lms-text"
                    href={`${base}/checkout?course=${o.course_id}`}
                  >
                    View payment details
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }
  const filteredOrders = orders.filter(
    (o) =>
      filter === "all" ||
      (filter === "pending"
        ? ["pending", "review", "rejected"].includes(o.status)
        : o.status === filter || (filter === "paid" && o.status === "granted")),
  );
  const recommendations = catalog
    .filter(
      (c) => c.enrollment_open && !orders.some((o) => o.course_id === c.id),
    )
    .slice(0, 2);
  return (
    <div className="student-dashboard">
      <aside className="sd-sidebar">
        <div className="sd-identity">
          {avatar()}
          <strong>{name}</strong>
          <span>Student account</span>
          <Link href={`${base}/dashboard?tab=profile`}>
            Edit profile <ArrowRight size={13} />
          </Link>
        </div>
        <label className="sd-mobile-nav">
          Your dashboard
          <select
            aria-label="Dashboard section"
            value={section}
            onChange={(e) =>
              router.push(`${base}/dashboard?tab=${e.target.value}`)
            }
          >
            {sections.map(([key, title]) => (
              <option key={key} value={key}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Student dashboard navigation">
          {sections.map(([key, title, Icon]) => (
            <Link
              key={key}
              aria-current={section === key ? "page" : undefined}
              href={`${base}/dashboard?tab=${key}`}
            >
              <Icon size={19} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="sd-sidebar-bottom">
          <a href="https://wa.me/6785288141">
            <LifeBuoy size={18} /> Training support
          </a>
        </div>
      </aside>
      <section className="sd-main" aria-label="Student dashboard content">
        <header className="sd-title">
          <div>
            <p className="sd-kicker">MY LEARNING SPACE</p>
            <h1>
              {section === "overview"
                ? `Welcome back, ${first}.`
                : sections.find((s) => s[0] === section)?.[1]}
            </h1>
            <p>
              {section === "overview"
                ? "Make space for your next chapter. One lesson at a time."
                : "Everything you need for your learning journey, in one place."}
            </p>
          </div>
          <button
            className="sd-icon-button"
            aria-label="Refresh dashboard"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await onRefresh();
                await load();
                setMessage("Dashboard updated.");
              })
            }
          >
            <RefreshCw size={19} />
          </button>
        </header>
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
        {loading ? (
          <div className="sd-panel">Loading your personal learning space…</div>
        ) : (
          <>
            {section === "overview" && (
              <>
                <div className="sd-welcome">
                  <div>
                    <span>LEARN. BUILD. GROW.</span>
                    <h2>
                      Your future is a work in progress.
                      <br />
                      Keep building it.
                    </h2>
                    <p>
                      {paid.length
                        ? "Your classes, projects and community are ready when you are."
                        : "Start with a course that brings your ideas to life."}
                    </p>
                    <Link
                      className="lms-button"
                      href={paid[0] ? courseLink(paid[0].course_id) : base}
                    >
                      {paid[0] ? "Continue learning" : "Find your first course"}{" "}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                  <Image
                    src="/images/training/hero.webp"
                    alt="Pacific learners developing their skills together"
                    width={350}
                    height={300}
                    priority
                  />
                </div>
                <div className="sd-stats">
                  {[
                    [BookOpen, paid.length, "Enrolled courses"],
                    [CheckCircle2, validProgress.length, "Lessons completed"],
                    [ClipboardCheck, quizzes.length, "Quizzes passed"],
                    [
                      Clock3,
                      orders.filter((o) => o.status === "review").length,
                      "Payments in review",
                    ],
                  ].map(([Icon, value, label]) => {
                    const I = Icon as typeof BookOpen;
                    return (
                      <div key={String(label)}>
                        <I size={22} />
                        <strong>{String(value)}</strong>
                        <span>{String(label)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="sd-overview-grid">
                  <section>
                    <div className="sd-section-title">
                      <h2>Pick up where you left off</h2>
                      <Link href={`${base}/dashboard?tab=courses`}>
                        View all <ArrowRight size={15} />
                      </Link>
                    </div>
                    {mine.length
                      ? courseCards(mine.slice(0, 2))
                      : empty(
                          "Your learning journey starts here",
                          "Explore practical courses in business, AI and digital skills.",
                        )}
                    {recommendations.length > 0 && (
                      <section className="sd-panel sd-recommendations">
                        <h3>A next step for you</h3>
                        {recommendations.map((c) => (
                          <Link
                            key={c.id}
                            href={
                              c.cohort_id
                                ? "/vanuatu-training"
                                : programs[c.slug]
                                  ? `${base}/programs/${c.slug}`
                                  : `${base}/checkout?course=${c.slug}`
                            }
                          >
                            <BookOpen size={20} />
                            <span>
                              <strong>{c.title}</strong>
                              <small>{money(c.amount, c.currency)}</small>
                            </span>
                            <ArrowRight size={18} />
                          </Link>
                        ))}
                      </section>
                    )}
                  </section>
                  <aside>
                    <section className="sd-panel sd-profile-completion">
                      <Target size={28} />
                      <h3>Make this space yours</h3>
                      <p>
                        Add your photo and learning goals so your profile
                        reflects your journey.
                      </p>
                      <div className="sd-progress-label">
                        <span>Profile complete</span>
                        <strong>{completion}%</strong>
                      </div>
                      <progress
                        aria-label="Profile completion"
                        max={100}
                        value={completion}
                      />
                      <Link href={`${base}/dashboard?tab=profile`}>
                        Complete my profile <ArrowRight size={16} />
                      </Link>
                    </section>
                    <section className="sd-panel">
                      <div className="sd-section-title">
                        <h3>Up next</h3>
                        <CalendarDays size={20} />
                      </div>
                      {upcoming.slice(0, 2).map((l) => (
                        <Link
                          className="sd-upcoming"
                          href={courseLink(l.course_id)}
                          key={l.id}
                        >
                          <strong>{date(l.starts_at!)}</strong>
                          <span>{l.title}</span>
                          <small>
                            {time(l.starts_at!)} · {profile.timezone}
                          </small>
                        </Link>
                      ))}
                      {!upcoming.length && (
                        <p>
                          No scheduled sessions yet. Your confirmed class dates
                          will appear here.
                        </p>
                      )}
                      <Link
                        className="lms-text"
                        href={`${base}/dashboard?tab=schedule`}
                      >
                        View my schedule
                      </Link>
                    </section>
                  </aside>
                </div>
              </>
            )}
            {section === "courses" && (
              <>
                <div className="sd-filter">
                  <label>
                    Filter courses
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All courses</option>
                      <option value="paid">Enrolled</option>
                      <option value="pending">Awaiting payment</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </label>
                </div>
                {filteredOrders.length
                  ? courseCards(filteredOrders)
                  : empty(
                      "No courses in this view",
                      "Your enrolled courses and payment statuses will appear here.",
                    )}
              </>
            )}
            {section === "schedule" && (
              <section className="sd-panel">
                <div className="sd-section-title">
                  <div>
                    <h2>Your upcoming classes</h2>
                    <p>
                      Times shown in {profile.timezone}. Change your time zone
                      in My profile.
                    </p>
                  </div>
                  {upcoming.length > 0 && (
                    <button className="lms-button" onClick={calendar}>
                      <Download size={16} /> Add to calendar
                    </button>
                  )}
                </div>
                {upcoming.length
                  ? upcoming.map((l) => (
                      <div className="sd-schedule-row" key={l.id}>
                        <div className="sd-date-tile">
                          <CalendarDays size={22} />
                          <strong>{date(l.starts_at!)}</strong>
                        </div>
                        <div>
                          <h3>{l.title}</h3>
                          <p>{myCourse(l.course_id)?.title}</p>
                          <span>
                            {time(l.starts_at!)} · {profile.timezone}
                          </span>
                        </div>
                        <Link href={courseLink(l.course_id)}>
                          Open course <ArrowRight size={16} />
                        </Link>
                      </div>
                    ))
                  : empty(
                      "Your schedule is clear",
                      "Once your instructor schedules a session, it will appear here. Mentorship times are arranged personally.",
                      false,
                    )}
              </section>
            )}
            {section === "quizzes" && (
              <section className="sd-panel">
                <h2>Your quiz achievements</h2>
                <p>Results from quizzes you have passed in your courses.</p>
                {quizzes.length
                  ? quizzes.map((p) => {
                      const l = lessons.find((l) => l.id === p.lesson_id);
                      return (
                        <div className="sd-result-row" key={p.lesson_id}>
                          <CheckCircle2 size={25} />
                          <div>
                            <h3>{l?.title || "Completed quiz"}</h3>
                            <p>
                              {myCourse(l?.course_id || "")?.title} ·{" "}
                              {date(p.completed_at)}
                            </p>
                          </div>
                          <strong>{p.score}%</strong>
                          <span className="sd-status" data-status="paid">
                            Passed
                          </span>
                        </div>
                      );
                    })
                  : empty(
                      "Your achievements are ahead of you",
                      "Complete a course quiz to see your result here.",
                      false,
                    )}
              </section>
            )}
            {section === "purchases" && (
              <section className="sd-panel">
                <div className="sd-section-title">
                  <div>
                    <h2>Your course purchases</h2>
                    <p>
                      Registration references, payment methods and current
                      payment status.
                    </p>
                  </div>
                  {orders.length > 0 && (
                    <button className="lms-button" onClick={downloadHistory}>
                      <Download size={16} /> Export history
                    </button>
                  )}
                </div>
                {orders.length ? (
                  <div className="sd-purchases">
                    {orders.map((o) => (
                      <article key={o.id}>
                        <header>
                          <div>
                            <h3>
                              {myCourse(o.course_id)?.title ||
                                "Course registration"}
                            </h3>
                            <p>
                              {date(o.created_at)} ·{" "}
                              {o.bank ||
                                o.method ||
                                "Payment method not selected"}
                            </p>
                          </div>
                          <strong>{money(o.amount, o.currency)}</strong>
                        </header>
                        <div className="sd-purchase-meta">
                          <span className="sd-status" data-status={o.status}>
                            {o.status === "granted"
                              ? "Package access · no payment"
                              : o.method === "coupon"
                                ? "Full discount"
                                : o.status === "paid"
                                  ? "Paid"
                                  : statusLabel(o.status)}
                          </span>
                          <span>
                            Reference: <code>{o.id}</code>
                          </span>
                        </div>
                        {o.review_note && (
                          <p className="lms-notice">{o.review_note}</p>
                        )}
                        <Link href={`${base}/checkout?course=${o.course_id}`}>
                          {["paid", "granted"].includes(o.status)
                            ? "View enrolment"
                            : "Payment details / upload proof"}{" "}
                          <ArrowRight size={16} />
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  empty(
                    "No purchases yet",
                    "Your course registrations and payments will appear here.",
                  )
                )}
              </section>
            )}
            {section === "community" && (
              <section className="sd-panel">
                <h2>Your learning communities</h2>
                <p>
                  Join your classmates, ask your instructor questions and
                  collaborate in course groups.
                </p>
                {paid.filter((o) => !myCourse(o.course_id)?.private_sessions)
                  .length
                  ? paid
                      .filter((o) => !myCourse(o.course_id)?.private_sessions)
                      .map((o) => (
                        <Link
                          className="sd-community-link"
                          key={o.id}
                          href={`${courseLink(o.course_id)}?tab=community`}
                        >
                          <MessageCircle size={28} />
                          <div>
                            <h3>{myCourse(o.course_id)?.title}</h3>
                            <p>
                              Course lounge, instructor announcements and your
                              groups
                            </p>
                          </div>
                          <ArrowRight size={20} />
                        </Link>
                      ))
                  : empty(
                      "Your community is waiting",
                      "Group-course communities open after payment is confirmed. One-on-one mentorship has its own private course space.",
                      false,
                    )}
              </section>
            )}
            {section === "profile" && (
              <form
                className="sd-panel sd-profile-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    await profileApi(draft);
                    setProfile({ ...profile, ...draft });
                    window.dispatchEvent(new Event("student-profile-updated"));
                    setMessage("Your profile has been saved.");
                  });
                }}
              >
                <h2>Your profile, your story</h2>
                <p>
                  Your contact information, bio and learning goals are private
                  to your student account. These details are not published in
                  course chat.
                </p>
                <div className="sd-photo-editor">
                  {avatar(96)}
                  <div>
                    <label className="sd-upload">
                      {" "}
                      <Camera size={17} /> Upload profile photo
                      <input
                        aria-label="Upload profile photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          run(async () => {
                            if (file.size > 3145728)
                              throw Error("Choose a photo smaller than 3 MB.");
                            const r = await authFetch(
                              "/api/lms-profile?action=avatar",
                              {
                                method: "POST",
                                headers: { "Content-Type": file.type },
                                body: file,
                              },
                            );
                            const d = await r.json();
                            if (!r.ok) throw Error(d.error);
                            setProfile((p) => ({
                              ...p,
                              avatar_url: d.avatar_url,
                            }));
                            setDraft((p) => ({
                              ...p,
                              avatar_url: d.avatar_url,
                            }));
                            window.dispatchEvent(
                              new Event("student-profile-updated"),
                            );
                            setMessage("Your profile photo has been updated.");
                          });
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p>
                      JPG, PNG or WebP · Max 3 MB. Photos are cropped to a
                      square.
                    </p>
                    {profile.avatar_url && (
                      <button
                        type="button"
                        className="lms-text"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await profileApi({}, "remove-avatar");
                            setProfile((p) => ({ ...p, avatar_url: "" }));
                            setDraft((p) => ({ ...p, avatar_url: "" }));
                            window.dispatchEvent(
                              new Event("student-profile-updated"),
                            );
                            setMessage("Profile photo removed.");
                          })
                        }
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                <fieldset disabled={busy}>
                  <div className="sd-form-grid">
                    {[
                      ["full_name", "Full name", "text", 120],
                      ["phone", "Phone / WhatsApp", "tel", 40],
                      ["city", "City / island", "text", 100],
                      ["country", "Country", "text", 100],
                      ["occupation", "Occupation / role", "text", 120],
                      ["organization", "Business / organisation", "text", 160],
                      ["website", "Website (optional)", "url", 500],
                    ].map(([key, label, type, max]) => (
                      <label key={key}>
                        {label}
                        <input
                          name={String(key)}
                          type={String(type)}
                          maxLength={Number(max)}
                          required={key === "full_name"}
                          minLength={key === "full_name" ? 2 : undefined}
                          value={String(
                            draft[key as keyof StudentProfile] || "",
                          )}
                          onChange={(e) =>
                            setDraft({ ...draft, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <label>
                      Time zone
                      <select
                        value={draft.timezone}
                        onChange={(e) =>
                          setDraft({ ...draft, timezone: e.target.value })
                        }
                      >
                        {Array.from(
                          new Set([
                            draft.timezone,
                            "Pacific/Efate",
                            ...Intl.supportedValuesOf("timeZone"),
                          ]),
                        ).map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    About me
                    <textarea
                      name="bio"
                      maxLength={1000}
                      value={draft.bio}
                      onChange={(e) =>
                        setDraft({ ...draft, bio: e.target.value })
                      }
                      placeholder="Tell us about your background, interests and experience."
                    />
                  </label>
                  <label>
                    My learning goals
                    <textarea
                      name="learning_goals"
                      maxLength={2000}
                      value={draft.learning_goals}
                      onChange={(e) =>
                        setDraft({ ...draft, learning_goals: e.target.value })
                      }
                      placeholder="What would you like to learn, build or achieve?"
                    />
                  </label>
                  <div className="sd-form-actions">
                    <span>
                      Only your full name is required. Add other details at your
                      pace.
                    </span>
                    <button className="lms-button">
                      Save profile <CheckCircle2 size={17} />
                    </button>
                  </div>
                </fieldset>
              </form>
            )}
            {section === "settings" && (
              <section className="sd-panel">
                <h2>Account & security</h2>
                <div className="sd-account-row">
                  <div>
                    <h3>Email address</h3>
                    <p>{email}</p>
                  </div>
                  <span className="sd-status" data-status="paid">
                    Verified
                  </span>
                </div>
                <div className="sd-account-row">
                  <div>
                    <h3>Account created</h3>
                    <p>
                      {joined ? date(joined) : "Welcome to the training centre"}
                    </p>
                  </div>
                </div>
                <div className="sd-account-row">
                  <div>
                    <h3>Password</h3>
                    <p>Request a secure email link to choose a new password.</p>
                  </div>
                  <button
                    className="lms-button"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const r = await authFetch("/api/lms/account", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email, mode: "recovery" }),
                        });
                        const d = await r.json();
                        if (!r.ok) throw Error(d.error);
                        setMessage(
                          "Password reset instructions sent. Check your inbox and spam folder.",
                        );
                      })
                    }
                  >
                    Send reset email
                  </button>
                </div>
                <p>
                  Need to change your email address or get help with your
                  account?{" "}
                  <a href="mailto:steve@pacificwavedigital.com">
                    Contact training support
                  </a>
                  .
                </p>
                <Link href="/privacy#training-registrations">
                  Training privacy notice
                </Link>
              </section>
            )}
          </>
        )}
        <footer className="sd-footer">
          Pacific Wave Digital · Your next chapter starts here.
        </footer>
      </section>
    </div>
  );
}
