"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  Upload,
  LockKeyhole,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/auth-fetch";
import {
  money,
  type Course,
  type Bank,
  type Order,
  type Lesson,
  type Progress,
} from "@/lib/lms/types";
import dynamic from "next/dynamic";
const QuizPlayer = dynamic(() => import("./QuizPlayer"));
const StudentDashboard = dynamic(() => import("./StudentDashboard"));
import LessonThumbnail from "./LessonThumbnail";
import StudentAccountMenu from "./StudentAccountMenu";
const CourseCommunity = dynamic(() => import("./CourseCommunity"));
import ProgramDetail from "./ProgramDetail";
import { programs, mentorshipSlug } from "@/lib/lms/programs";
const base = "/training-center";
async function api(path: string, body?: unknown) {
  const r = await authFetch(
    `/api/lms/${path}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Please try again.");
  return data;
}
const when = (s: string) =>
  new Date(s).toLocaleString("en-GB", {
    timeZone: "Pacific/Efate",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export default function TrainingCenter({
  path,
  query,
  initialCourses,
}: {
  initialCourses?: Course[];
  path: string[];
  query: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const view = path[0] || "catalog";
  const coursePathId = path[1];
  const [courseTab, setCourseTab] = useState(
    query.tab === "community" ? "community" : "lessons",
  );
  const [recordingUrl, setRecordingUrl] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const [playVideo, setPlayVideo] = useState<string | null>(null);
  const [sandbox, setSandbox] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses || []),
    [banks, setBanks] = useState<Bank[]>([]),
    [card, setCard] = useState(false),
    [email, setEmail] = useState<string | null>(null),
    [ready, setReady] = useState(Boolean(initialCourses) || view === "account"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [orders, setOrders] = useState<Order[]>([]),
    [progress, setProgress] = useState<Progress[]>([]),
    [lessons, setLessons] = useState<Lesson[]>([]),
    [active, setActive] = useState<Lesson | null>(null),
    [current, setCurrent] = useState<Course | null>(null),
    [selectedBank, setSelectedBank] = useState(""),
    [authMode, setAuthMode] = useState(
      query.mode === "reset"
        ? "reset"
        : query.mode === "signup" || (query.course && query.mode !== "signin")
          ? "signup"
          : "signin",
    );
  const [accountEmail, setAccountEmail] = useState("");
  useEffect(() => {
    if (view === "account")
      setAuthMode(
        query.mode === "reset"
          ? "reset"
          : query.mode === "signup" || (query.course && query.mode !== "signin")
            ? "signup"
            : "signin",
      );
  }, [view, query.mode, query.course]);
  useEffect(() => {
    if (view === "course")
      setCourseTab(query.tab === "community" ? "community" : "lessons");
    setActive(null);
    setRecordingUrl(null);
  }, [view, query.tab, coursePathId]);

  const refresh = useCallback(async () => {
    const publicPage = view === "catalog" || view === "programs";
    const needsCatalog =
      !["account", "course"].includes(view) && (!publicPage || !initialCourses);
    const [catalog, auth] = await Promise.all([
      needsCatalog ? api("catalog") : Promise.resolve(null),
      supabase.auth.getSession(),
    ]);
    if (catalog) {
      setCourses(catalog.courses);
      setSandbox(catalog.sandbox);
      setBanks(catalog.banks);
      setCard(catalog.stripe);
    }
    const {
      data: { session },
    } = auth;
    setEmail(session?.user.email || null);
    if (session && ["dashboard", "checkout", "course"].includes(view)) {
      const [dash, detail] = await Promise.all([
        api("dashboard"),
        view === "course" && coursePathId
          ? api(`course?id=${encodeURIComponent(coursePathId)}`)
          : Promise.resolve(null),
      ]);
      setOrders(dash.orders);
      setProgress(dash.progress);
      if (detail) {
        setCurrent(detail.course);
        setLessons(detail.lessons);
      }
    }
  }, [view, coursePathId, initialCourses]);
  useEffect(() => {
    let alive = true;
    refresh()
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email || null);
      if (_event === "PASSWORD_RECOVERY") setAuthMode("update");
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [refresh]);
  useEffect(() => {
    if (
      view === "account" &&
      email &&
      query.course &&
      !query.verify &&
      !["reset", "update"].includes(authMode)
    ) {
      router.replace(
        `${base}/checkout?course=${encodeURIComponent(query.course)}`,
      );
    } else if (
      view === "checkout" &&
      ready &&
      !email &&
      query.course &&
      courses.some(
        (c) =>
          (c.id === query.course || c.slug === query.course) &&
          c.enrollment_open,
      )
    ) {
      router.replace(
        `${base}/account?mode=signup&course=${encodeURIComponent(query.course)}`,
      );
    }
  }, [
    view,
    email,
    ready,
    query.course,
    query.verify,
    authMode,
    router,
    courses,
  ]);
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const verify = query.verify || null;
  const verifyType = query.type || null;
  const queryCourse = query.course || null;
  const checkout =
    courses.find((c) => c.id === queryCourse || c.slug === queryCourse) ||
    (queryCourse ? undefined : courses[0]);
  const order = orders.find((o) => o.course_id === checkout?.id);
  const courseOrder = orders.find((o) => o.course_id === current?.id);
  const authUrl = `${base}/account?mode=signup${queryCourse ? `&course=${encodeURIComponent(queryCourse)}` : ""}`;
  function calendar() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Pacific Wave Digital//Training//EN",
    ];
    for (const l of lessons.filter((l) => l.starts_at)) {
      const start = new Date(l.starts_at!),
        end = new Date(start.getTime() + 7200000);
      const stamp = (d: Date) =>
        d
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${l.id}@pacificwavedigital.com`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${l.title.replace(/[\r\n,;]/g, " ")}`,
        "END:VEVENT",
      );
    }
    lines.push("END:VCALENDAR");
    const url = URL.createObjectURL(
      new Blob([lines.join("\r\n")], { type: "text/calendar" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "training-calendar.ics";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className={`lms ${view === "dashboard" ? "lms-dashboard-page" : ""}`}>
      <div className="lms-shell">
        <nav className="lms-nav" aria-label="Training navigation">
          <Link href={base} className="lms-brand">
            <Image
              src="/images/training/pwd-logo.png"
              width={44}
              height={44}
              alt="Pacific Wave Digital"
            />
            <span>
              TRAINING CENTRE<small>Pacific Wave Digital</small>
            </span>
          </Link>
          <div>
            <Link href="/">Main website</Link>
            <Link href={base}>Explore courses</Link>
            <Link
              href={
                email
                  ? `${base}/dashboard`
                  : authUrl.replace("mode=signup", "mode=signin")
              }
            >
              {email ? "My learning" : "Student sign in"}
            </Link>
          </div>
          {email && (
            <StudentAccountMenu
              email={email}
              onLogout={() =>
                run(async () => {
                  const result = await supabase.auth.signOut();
                  if (result.error) throw result.error;
                  setOrders([]);
                  router.push(base);
                })
              }
            />
          )}
        </nav>
        {sandbox && (
          <div className="lms-notice">
            Preview mode: registration emails go to a test inbox. Your review
            here will not trigger a real card charge.
          </div>
        )}
        {error && (
          <div className="lms-alert" role="alert">
            {error} <button onClick={() => run(refresh)}>Try again</button>
          </div>
        )}
        {message && (
          <div className="lms-notice" role="status">
            {message}
          </div>
        )}
        {!ready ? (
          <p className="lms-panel">Loading your training centre…</p>
        ) : (
          <>
            {view === "catalog" && (
              <>
                <section className="lms-hero">
                  <div>
                    <p className="lms-eyebrow">
                      LEARN HERE. BUILD WHAT’S NEXT.
                    </p>
                    <h1>
                      Your next chapter
                      <br />
                      <em>starts with a skill.</em>
                    </h1>
                    <p>
                      Practical learning for people building businesses in
                      Vanuatu and across the Pacific. Join a live class. Learn
                      at your pace. Put it into practice.
                    </p>
                    <a className="lms-button" href="#courses">
                      Find your course <ArrowRight size={18} />
                    </a>
                    <div className="lms-hero-facts">
                      <span>
                        <GraduationCap />
                        Practical projects
                      </span>
                      <span>
                        <PlayCircle />
                        Class replays
                      </span>
                      <span>
                        <CalendarDays />
                        Live & self-paced
                      </span>
                    </div>
                  </div>
                  <div className="lms-hero-image">
                    <Image
                      src="/images/training/hero.webp"
                      alt="Pacific learners working together at a laptop"
                      fill
                      priority
                      sizes="(max-width: 800px) 100vw, 45vw"
                    />
                    <div className="lms-float">
                      <span className="lms-dot" /> OCTOBER COHORT
                      <small>Start 5 October · Vanuatu</small>
                    </div>
                  </div>
                </section>
                <section id="courses" className="lms-section">
                  <div className="lms-section-head">
                    <div>
                      <p className="lms-eyebrow">YOUR LEARNING JOURNEY</p>
                      <h2>Find your next course</h2>
                    </div>
                    <p>Real skills. A clear path forward.</p>
                  </div>
                  <div className="lms-grid lms-catalog-grid">
                    {courses.map((c) => (
                      <article className="lms-course-card" key={c.id}>
                        <div className="lms-card-art">
                          <Image
                            src={
                              programs[c.slug]?.image ||
                              "/images/training/hero.webp"
                            }
                            alt={programs[c.slug]?.alt || c.title}
                            fill
                            sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 400px"
                          />
                          <span>
                            {!c.enrollment_open
                              ? "COMING SOON"
                              : programs[c.slug]?.label ||
                                (c.kind === "live"
                                  ? "LIVE COHORT"
                                  : "ON DEMAND")}
                          </span>
                        </div>
                        <div className="lms-card-body">
                          <p className="lms-eyebrow">
                            {c.private_sessions
                              ? "PERSONAL GUIDANCE"
                              : c.kind === "live"
                                ? "LEARN TOGETHER"
                                : "LEARN AT YOUR PACE"}
                          </p>
                          <h3>{c.title}</h3>
                          <p>{c.description}</p>
                          {programs[c.slug] && (
                            <p className="lms-meta">
                              <CalendarDays size={16} />
                              {programs[c.slug].duration}
                            </p>
                          )}
                          <div className="lms-card-bottom">
                            <strong>
                              {c.enrollment_open
                                ? money(c.amount, c.currency)
                                : "Coming soon"}
                              <small>
                                {!c.enrollment_open
                                  ? "Details to be announced"
                                  : c.slug === mentorshipSlug
                                    ? "Total for 3 months"
                                    : "One-time course fee"}
                              </small>
                            </strong>
                            <Link
                              className="lms-button"
                              href={
                                programs[c.slug] && !c.cohort_id
                                  ? `${base}/programs/${c.slug}`
                                  : `${base}/account?mode=signup&course=${c.slug}`
                              }
                            >
                              {c.cohort_id ? "Register" : "View course"}
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="lms-banner">
                  <ShieldCheck size={40} />
                  <div>
                    <h2>A learning space that stays with you.</h2>
                    <p>
                      Your classes, recordings, quizzes and progress — together
                      in your personal dashboard.
                    </p>
                  </div>
                  <Link href={`${base}/dashboard`}>Open my dashboard →</Link>
                </section>
              </>
            )}
            {view === "programs" &&
              (courses.find((c) => c.slug === path[1]) ? (
                <ProgramDetail
                  course={courses.find((c) => c.slug === path[1])!}
                />
              ) : (
                <div className="lms-panel">
                  <h1>Course unavailable</h1>
                  <Link href={base}>Explore courses</Link>
                </div>
              ))}
            {view === "account" && (
              <section className="lms-auth">
                <aside
                  className="lms-auth-visual"
                  aria-label="Learn with Pacific Wave Digital"
                >
                  <Image
                    src="/images/training/hero.webp"
                    alt="Pacific students learning together around a laptop"
                    fill
                    priority
                    sizes="(max-width: 760px) 100vw, 550px"
                  />
                  <div className="lms-auth-visual-shade" />
                  <span className="lms-auth-visual-tag">
                    <GraduationCap size={18} aria-hidden="true" /> YOUR FUTURE
                    STARTS HERE
                  </span>
                  <div className="lms-auth-story">
                    <span className="lms-auth-accent" />
                    <h2>
                      Build your skills.
                      <br />
                      Create your future.
                    </h2>
                    <p>
                      Learn alongside people with ideas, ambition and the
                      courage to take the next step.
                    </p>
                    <div className="lms-auth-benefits">
                      <span>
                        <BookOpen size={16} aria-hidden="true" />
                        Practical learning
                      </span>
                      <span>
                        <PlayCircle size={16} aria-hidden="true" />
                        Class recordings
                      </span>
                    </div>
                  </div>
                </aside>
                <div className="lms-auth-form">
                  <p className="lms-auth-kicker">
                    PACIFIC WAVE DIGITAL · TRAINING CENTRE
                  </p>

                  {authMode === "signup" && queryCourse && checkout && (
                    <div className="lms-notice">
                      <strong>{checkout.title}</strong>
                      <p>
                        {money(checkout.amount, checkout.currency)} · One-time
                        course fee
                      </p>
                    </div>
                  )}
                  <h1>
                    {authMode === "signup"
                      ? "Create your student account"
                      : authMode === "reset"
                        ? "Reset your password"
                        : authMode === "update"
                          ? "Choose a new password"
                          : "Welcome back"}
                  </h1>
                  <p>
                    {authMode === "signup"
                      ? "Register once, then choose how to pay. No email confirmation needed."
                      : "Your courses, class recordings and learning progress in one place."}
                  </p>
                  {accountEmail && (
                    <div className="lms-notice">
                      <p>
                        Account email: <strong>{accountEmail}</strong>
                      </p>
                      <button
                        className="lms-text"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api("account", {
                              email: accountEmail,
                              mode: "recovery",
                              course: queryCourse || undefined,
                            });
                            setMessage(
                              "If an account exists for this address, a fresh access email has been sent. Check your inbox and spam folder.",
                            );
                          })
                        }
                      >
                        Resend access email
                      </button>
                    </div>
                  )}
                  {verify && (
                    <button
                      className="lms-button"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const { error } = await supabase.auth.verifyOtp({
                            token_hash: verify,
                            type:
                              verifyType === "recovery" ? "recovery" : "signup",
                          });
                          if (error) throw error;
                          window.history.replaceState(
                            {},
                            "",
                            `${base}/account`,
                          );
                          if (verifyType === "recovery") setAuthMode("update");
                          else {
                            setMessage(
                              "Email verified. Your student account is ready.",
                            );
                            router.push(
                              queryCourse
                                ? `${base}/checkout?course=${encodeURIComponent(queryCourse)}`
                                : `${base}/dashboard`,
                            );
                          }
                        })
                      }
                    >
                      Confirm{" "}
                      {verifyType === "recovery"
                        ? "password reset"
                        : "email address"}
                    </button>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      run(async () => {
                        const address = String(f.get("email") || ""),
                          password = String(f.get("password") || "");
                        if (authMode === "reset") setAccountEmail(address);
                        if (authMode === "update") {
                          const { error } = await supabase.auth.updateUser({
                            password,
                          });
                          if (error) throw error;
                          setAuthMode("signin");
                          setMessage("Password updated. You can now sign in.");
                          return;
                        }
                        if (authMode === "reset") {
                          await api("account", {
                            email: address,
                            mode: "recovery",
                            course: queryCourse || undefined,
                          });
                          setMessage(
                            "If an account exists, a password reset email will arrive shortly.",
                          );
                          return;
                        }
                        if (authMode === "signup") {
                          await api("account", {
                            email: address,
                            password,
                            name: f.get("name"),
                            phone: f.get("phone"),
                            location: f.get("location"),
                            attendance: f.get("attendance"),
                            acknowledged: f.get("privacy") === "on",
                            mode: "signup",
                            course: queryCourse || undefined,
                          });
                          // Sign in immediately using the supplied password; the new account
                          // and pending enrollment were created together on the server.
                        }
                        const result = await supabase.auth.signInWithPassword({
                          email: address,
                          password,
                        });
                        if (result.error) throw result.error;
                        if (!result.data.session) {
                          setMessage(
                            "Check your inbox for the verification link, then return here to sign in.",
                          );
                          return;
                        }
                        router.push(
                          queryCourse
                            ? `${base}/checkout?course=${queryCourse}`
                            : `${base}/dashboard`,
                        );
                      });
                    }}
                  >
                    <fieldset disabled={busy}>
                      {authMode === "signup" && (
                        <>
                          <label>
                            Full name
                            <input
                              name="name"
                              autoComplete="name"
                              minLength={2}
                              maxLength={120}
                              required
                            />
                          </label>
                          <label>
                            Phone / WhatsApp
                            <input
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="+678 …"
                              minLength={5}
                              maxLength={40}
                              required
                            />
                          </label>
                          <label>
                            Location (town, island or country)
                            <input
                              name="location"
                              autoComplete="address-level2"
                              placeholder="e.g. Port Vila, Efate"
                              minLength={2}
                              maxLength={100}
                              required
                            />
                          </label>
                          <label>
                            How would you like to attend?
                            <select name="attendance" required defaultValue="">
                              <option value="" disabled>
                                Choose your attendance
                              </option>
                              <option value="online">Online</option>
                              <option value="in_person">
                                In person (physical class)
                              </option>
                              <option value="mixed">A mix of both</option>
                            </select>
                          </label>
                        </>
                      )}
                      {authMode !== "update" && (
                        <label>
                          Email address
                          <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                          />
                        </label>
                      )}
                      {authMode !== "reset" && (
                        <label>
                          Password
                          <input
                            name="password"
                            type="password"
                            minLength={
                              authMode === "signup" || authMode === "update"
                                ? 10
                                : 1
                            }
                            autoComplete={
                              authMode === "signin"
                                ? "current-password"
                                : "new-password"
                            }
                            required
                          />
                        </label>
                      )}
                      {authMode === "signup" && (
                        <label className="lms-check">
                          <input name="privacy" type="checkbox" required />I
                          agree to the{" "}
                          <Link href="/privacy#training-registrations">
                            training privacy notice
                          </Link>
                          .
                        </label>
                      )}
                      <button className="lms-button">
                        {busy
                          ? "Please wait…"
                          : authMode === "signup"
                            ? queryCourse
                              ? "Register & continue to payment"
                              : "Create my account"
                            : authMode === "reset"
                              ? "Send reset email"
                              : authMode === "update"
                                ? "Save password"
                                : "Sign in"}
                        <ArrowRight size={18} />
                      </button>
                    </fieldset>
                  </form>
                  <div className="lms-auth-links">
                    <button
                      onClick={() =>
                        setAuthMode(authMode === "signup" ? "signin" : "signup")
                      }
                    >
                      {authMode === "signup"
                        ? "Already a student? Sign in"
                        : "New here? Create an account"}
                    </button>
                    {authMode === "signin" && (
                      <button onClick={() => setAuthMode("reset")}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <p className="lms-auth-reassurance">
                    <ShieldCheck size={16} aria-hidden="true" />
                    Your personal space to learn and grow.
                  </p>
                </div>
              </section>
            )}
            {view === "checkout" &&
              (!checkout || (!checkout.enrollment_open && !order)) && (
                <section className="lms-panel">
                  <h1>Course unavailable</h1>
                  <p>This course is not currently accepting registrations.</p>
                  <Link href={base}>Explore available courses →</Link>
                </section>
              )}
            {view === "checkout" &&
              checkout &&
              (checkout.enrollment_open || order) && (
                <>
                  <header className="lms-page-head">
                    <p className="lms-eyebrow">YOUR NEXT STEP</p>
                    <h1>Join the course</h1>
                    <p>Choose your payment option to complete enrollment.</p>
                  </header>
                  <div className="lms-two">
                    <section className="lms-panel">
                      <h2>{checkout.title}</h2>
                      <p>{checkout.description}</p>
                      <div className="lms-price">
                        {money(
                          order?.amount ?? checkout.amount,
                          order?.currency ?? checkout.currency,
                        )}
                      </div>
                      <p>
                        {checkout.private_sessions
                          ? "One-time fee for all 3 months"
                          : "One-time course fee"}
                      </p>
                      {checkout.cohort_id && (
                        <>
                          <hr />
                          <p>
                            <strong>12 live classes · 24 teaching hours</strong>
                            <br />
                            5–31 October · Mon, Thu & Sat
                            <br />
                            3–5 pm Vanuatu time (UTC+11)
                          </p>
                          <p>
                            Yumiwork, Nambatu, near Kaiviti Motel, or online.
                          </p>
                          <p>
                            Includes three free months of Digi Assist AI Pro and
                            one additional mentorship month. Continued Pro use
                            requires a paid subscription after the free period.
                          </p>
                        </>
                      )}
                      <Link
                        href={
                          checkout.cohort_id
                            ? "/vanuatu-training"
                            : `${base}/programs/${checkout.slug}`
                        }
                      >
                        Read the full course details →
                      </Link>
                      {checkout.private_sessions && (
                        <p>
                          Includes building one software project during the
                          programme and three free months of Digi Assist AI Pro.
                          Continued Pro use after the free period requires a
                          paid subscription. Sessions are arranged with your
                          mentor, with private recordings for your enrolment.
                        </p>
                      )}
                    </section>
                    <section className="lms-panel">
                      {!email ? (
                        <>
                          <h2>Start with your student account</h2>
                          <p>
                            Sign in or create an account to save your
                            registration and access your dashboard.
                          </p>
                          <Link className="lms-button" href={authUrl}>
                            Register to join <ArrowRight size={18} />
                          </Link>
                        </>
                      ) : !order ? (
                        <>
                          <h2>Your registration details</h2>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const f = new FormData(e.currentTarget);
                              run(async () => {
                                await api("order", {
                                  course_id: checkout.id,
                                  name: f.get("name"),
                                  phone: f.get("phone"),
                                  attendance: f.get("attendance"),
                                  acknowledged: true,
                                });
                                await refresh();
                              });
                            }}
                          >
                            <fieldset
                              disabled={busy || !checkout.enrollment_open}
                            >
                              <label>
                                Full name
                                <input
                                  name="name"
                                  required
                                  minLength={2}
                                  maxLength={120}
                                  autoComplete="name"
                                />
                              </label>
                              <label>
                                Phone / WhatsApp
                                <input
                                  name="phone"
                                  type="tel"
                                  required
                                  minLength={5}
                                  maxLength={40}
                                  defaultValue="+678 "
                                  autoComplete="tel"
                                />
                              </label>
                              <label>
                                How will you attend?
                                <select name="attendance">
                                  <option value="online">Online</option>
                                  <option value="in_person">In person</option>
                                  <option value="mixed">A mix of both</option>
                                </select>
                              </label>
                              <label className="lms-check">
                                <input type="checkbox" required />I understand
                                the course fee and have read the{" "}
                                <Link href="/privacy#training-registrations">
                                  privacy notice
                                </Link>
                                .
                              </label>
                              <button className="lms-button">
                                Save registration & continue{" "}
                                <ArrowRight size={18} />
                              </button>
                            </fieldset>
                          </form>
                        </>
                      ) : ["paid", "granted"].includes(order.status) ||
                        ["review", "revoked"].includes(order.status) ? (
                        <>
                          <CheckCircle2 size={40} />
                          <h2>
                            {["paid", "granted"].includes(order.status)
                              ? "You’re enrolled!"
                              : order.status === "revoked"
                                ? "Your access has been removed"
                                : "Your proof is under review"}
                          </h2>
                          <p>
                            {["paid", "granted"].includes(order.status)
                              ? "Your course is ready in your dashboard."
                              : order.status === "revoked"
                                ? "Please contact steve@pacificwavedigital.com if you need help with your package."
                                : "You can explore your introduction and timetable now. Paid lessons unlock after we verify your transfer."}
                          </p>
                          <Link
                            className="lms-button"
                            href={`${base}/course/${checkout.id}`}
                          >
                            Go to my course <ArrowRight size={18} />
                          </Link>
                        </>
                      ) : (
                        <>
                          <h2>Choose how to pay</h2>
                          {order.coupon_code ? (
                            <p className="lms-notice">
                              Coupon {order.coupon_code} applied · Saved{" "}
                              {money(
                                order.discount_amount || 0,
                                order.currency,
                              )}
                            </p>
                          ) : (
                            <form
                              className="lms-bank"
                              onSubmit={(e) => {
                                e.preventDefault();
                                const f = new FormData(e.currentTarget);
                                run(async () => {
                                  await api("coupon", {
                                    id: order.id,
                                    code: f.get("coupon"),
                                  });
                                  setMessage(
                                    "Coupon applied. Your payment total has been updated.",
                                  );
                                  await refresh();
                                });
                              }}
                            >
                              <label>
                                Have a coupon code?
                                <input
                                  name="coupon"
                                  required
                                  maxLength={40}
                                  placeholder="Enter your code"
                                />
                              </label>
                              <button className="lms-button" disabled={busy}>
                                Apply coupon
                              </button>
                            </form>
                          )}

                          <p>
                            Registration saved. Reference:{" "}
                            <strong>{order.id}</strong>
                          </p>
                          {order.review_note && (
                            <p className="lms-alert">{order.review_note}</p>
                          )}
                          <button
                            className="lms-button lms-wide"
                            disabled={busy || !card}
                            onClick={() =>
                              run(async () => {
                                const data = await api("checkout", {
                                  id: order.id,
                                });
                                window.location.assign(data.url);
                              })
                            }
                          >
                            Pay securely by card <ShieldCheck size={18} />
                          </button>
                          <p className="lms-muted">
                            Card payments are processed by Global Digital Prime,
                            Inc. for Pacific Wave Digital training.
                          </p>
                          {!card && (
                            <p className="lms-muted">
                              Card payments are being set up.
                            </p>
                          )}
                          <div className="lms-divider">or bank transfer</div>
                          {banks.filter((b) => b.currency === order.currency)
                            .length ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const f = new FormData(e.currentTarget);
                                run(async () => {
                                  const file = f.get("proof") as File;
                                  if (file.size > 3145728)
                                    throw new Error(
                                      "Choose a file smaller than 3 MB.",
                                    );
                                  const r = await authFetch(
                                    `/api/lms/proof?id=${order.id}&bank=${encodeURIComponent(selectedBank)}`,
                                    { method: "POST", body: file },
                                  );
                                  const data = await r.json();
                                  if (!r.ok) throw new Error(data.error);
                                  router.push(`${base}/course/${checkout.id}`);
                                });
                              }}
                            >
                              <fieldset disabled={busy}>
                                <label>
                                  Choose your bank
                                  <select
                                    required
                                    value={selectedBank}
                                    onChange={(e) =>
                                      setSelectedBank(e.target.value)
                                    }
                                  >
                                    <option value="">Select a bank</option>
                                    {banks
                                      .filter(
                                        (b) => b.currency === order.currency,
                                      )
                                      .map((b) => (
                                        <option key={b.bank}>{b.bank}</option>
                                      ))}
                                  </select>
                                </label>
                                {banks
                                  .filter((b) => b.bank === selectedBank)
                                  .map((b) => (
                                    <div className="lms-bank" key={b.bank}>
                                      <strong>{b.account_name}</strong>
                                      <p>
                                        Account: {b.account_number}
                                        <br />
                                        Branch: {b.branch}
                                        <br />
                                        Currency: {b.currency}
                                        {b.swift_code && (
                                          <>
                                            <br />
                                            SWIFT: {b.swift_code}
                                          </>
                                        )}
                                        {b.bank_address && (
                                          <>
                                            <br />
                                            Bank address: {b.bank_address}
                                          </>
                                        )}
                                      </p>
                                      <p>
                                        Use your registration reference with
                                        your transfer.
                                      </p>
                                    </div>
                                  ))}
                                <label>
                                  Upload payment proof (PDF, JPG or PNG · max 3
                                  MB)
                                  <input
                                    name="proof"
                                    type="file"
                                    required
                                    accept="application/pdf,image/jpeg,image/png"
                                  />
                                </label>
                                <p className="lms-muted">
                                  Your proof is private. We verify the transfer
                                  before unlocking paid lessons.
                                </p>
                                <button className="lms-button">
                                  <Upload size={18} />
                                  Submit proof & open dashboard
                                </button>
                              </fieldset>
                            </form>
                          ) : (
                            <p>
                              Bank instructions will be available shortly. Your
                              registration is saved. Contact{" "}
                              <a href="https://wa.me/6785288141">
                                our training team
                              </a>{" "}
                              for help.
                            </p>
                          )}
                          <Link href={`${base}/course/${checkout.id}`}>
                            View introduction and schedule →
                          </Link>
                        </>
                      )}
                    </section>
                  </div>
                </>
              )}
            {view === "dashboard" &&
              (!email ? (
                <div className="lms-panel">
                  <h1>Your learning space is waiting</h1>
                  <p>
                    Sign in to see your courses, profile and purchase history.
                  </p>
                  <Link className="lms-button" href={authUrl}>
                    Sign in to your dashboard
                  </Link>
                </div>
              ) : (
                <StudentDashboard
                  email={email}
                  orders={orders}
                  progress={progress}
                  courses={courses}
                  section={query.tab}
                  onRefresh={refresh}
                />
              ))}
            {view === "course" &&
              (!email ? (
                <div className="lms-panel">
                  <h1>Sign in to your course</h1>
                  <Link className="lms-button" href={`${base}/account`}>
                    Student sign in
                  </Link>
                </div>
              ) : (
                current && (
                  <>
                    <header className="lms-page-head">
                      <Link href={`${base}/dashboard`}>← My learning</Link>
                      <p className="lms-eyebrow">
                        {current.kind === "live"
                          ? "YOUR LIVE COHORT"
                          : "YOUR RECORDED COURSE"}
                      </p>
                      <h1>{current.title}</h1>
                      <p>
                        {
                          progress.filter((p) =>
                            lessons.some((l) => l.id === p.lesson_id),
                          ).length
                        }{" "}
                        of {lessons.length} lessons completed
                      </p>
                      <progress
                        aria-label="Course progress"
                        max={lessons.length || 1}
                        value={
                          progress.filter((p) =>
                            lessons.some((l) => l.id === p.lesson_id),
                          ).length
                        }
                      />
                    </header>
                    {!["paid", "granted"].includes(
                      courseOrder?.status || "",
                    ) && (
                      <div className="lms-notice">
                        {courseOrder?.status === "review"
                          ? "Your bank transfer is awaiting verification."
                          : "Complete payment to unlock published lessons."}{" "}
                        Your introduction and timetable are available now.{" "}
                        <Link href={`${base}/checkout?course=${current.id}`}>
                          Payment details →
                        </Link>
                      </div>
                    )}
                    <nav
                      className="lms-admin-tabs"
                      aria-label="Course sections"
                    >
                      <button
                        className={courseTab === "lessons" ? "selected" : ""}
                        onClick={() => setCourseTab("lessons")}
                      >
                        Lessons & recordings
                      </button>
                      <button
                        className={courseTab === "community" ? "selected" : ""}
                        onClick={() => setCourseTab("community")}
                      >
                        {current.private_sessions
                          ? "Private mentor chat"
                          : "Community & groups"}
                      </button>
                    </nav>
                    {courseTab === "community" && (
                      <CourseCommunity key={current.id} courseId={current.id} />
                    )}
                    <div
                      className="lms-learning"
                      style={
                        courseTab === "community"
                          ? { display: "none" }
                          : undefined
                      }
                    >
                      <aside className="lms-panel">
                        <h2>Course journey</h2>
                        <button
                          className={`lms-lesson ${!active ? "selected" : ""}`}
                          onClick={() => setActive(null)}
                        >
                          <BookOpen size={18} />
                          Start here: introduction
                        </button>
                        {lessons.map((l, i) => (
                          <button
                            className={`lms-lesson lms-lesson-with-image ${active?.id === l.id ? "selected" : ""}`}
                            key={l.id}
                            onClick={() => setActive(l)}
                          >
                            <LessonThumbnail url={l.thumbnail_url} />
                            <span className="lms-lesson-copy">
                              {l.section_title && (
                                <small>{l.section_title}</small>
                              )}
                              {progress.some((p) => p.lesson_id === l.id)
                                ? "✓ "
                                : `${i + 1}. `}
                              {l.title}
                              <small>
                                {l.starts_at
                                  ? when(l.starts_at)
                                  : current.private_sessions
                                    ? "Time arranged with your mentor"
                                    : "Learn at your pace"}
                                {!l.published ? " · Coming soon" : ""}
                              </small>
                            </span>
                          </button>
                        ))}
                        {lessons.some((l) => l.starts_at) && (
                          <button className="lms-text" onClick={calendar}>
                            <CalendarDays size={16} /> Add classes to calendar
                          </button>
                        )}
                      </aside>
                      <section className="lms-panel lms-content">
                        {!active ? (
                          <>
                            <p className="lms-eyebrow">START HERE</p>
                            <h2>Welcome to your course</h2>
                            <div className="lms-prose">
                              {current.introduction}
                            </div>
                            <div className="lms-bank">
                              <h3>Make the most of your learning</h3>
                              <p>
                                Set aside time to practise. Bring your questions
                                to class. Return here for recordings and quizzes
                                after each session.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="lms-eyebrow">
                              {active.starts_at
                                ? `${when(active.starts_at)} · VANUATU TIME`
                                : "ON-DEMAND LESSON"}
                            </p>
                            {active.thumbnail_url && (
                              <LessonThumbnail
                                url={active.thumbnail_url}
                                cover
                              />
                            )}
                            <h2>{active.title}</h2>
                            {!["paid", "granted"].includes(
                              courseOrder?.status || "",
                            ) ? (
                              <div className="lms-empty">
                                <LockKeyhole size={36} />
                                <h3>Unlock your learning</h3>
                                <p>
                                  This lesson becomes available after payment is
                                  verified.
                                </p>
                              </div>
                            ) : !active.published ? (
                              <div className="lms-empty">
                                <Clock3 size={36} />
                                <h3>Your next class is on the way</h3>
                                <p>
                                  Class materials and recordings will appear
                                  here when your trainer publishes them.
                                </p>
                              </div>
                            ) : (
                              <>
                                {active.has_recording && (
                                  <>
                                    <button
                                      className="lms-button"
                                      disabled={busy}
                                      onClick={() =>
                                        run(async () => {
                                          const r = await api(
                                            `recording?id=${active.id}`,
                                          );
                                          setRecordingUrl({
                                            id: active.id,
                                            url: r.url,
                                          });
                                        })
                                      }
                                    >
                                      <PlayCircle size={18} />{" "}
                                      {recordingUrl?.id === active.id
                                        ? "Refresh recording link"
                                        : "Play your private recording"}
                                    </button>
                                    {recordingUrl?.id === active.id && (
                                      <video
                                        key={recordingUrl.url}
                                        className="lms-video"
                                        controls
                                        preload="metadata"
                                        controlsList="nodownload"
                                        src={recordingUrl.url}
                                      >
                                        Your browser does not support video
                                        playback.
                                      </video>
                                    )}
                                  </>
                                )}
                                {active.youtube_id &&
                                  playVideo !== active.id && (
                                    <button
                                      className="lms-button"
                                      onClick={() => setPlayVideo(active.id)}
                                    >
                                      <PlayCircle size={18} />
                                      Load class recording
                                    </button>
                                  )}
                                {active.youtube_id &&
                                  playVideo === active.id && (
                                    <iframe
                                      className="lms-video"
                                      src={`https://www.youtube-nocookie.com/embed/${active.youtube_id}`}
                                      title={active.title}
                                      allow="encrypted-media; picture-in-picture; fullscreen"
                                      allowFullScreen
                                      loading="lazy"
                                    />
                                  )}
                                {active.meeting_url && (
                                  <p>
                                    <a
                                      className="lms-button"
                                      href={active.meeting_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Join live class <ArrowRight size={18} />
                                    </a>
                                  </p>
                                )}
                                <div className="lms-prose">
                                  {active.content}
                                </div>
                                {active.quiz.length ? (
                                  <QuizPlayer
                                    key={active.id}
                                    lesson={active}
                                    onComplete={refresh}
                                  />
                                ) : (
                                  <button
                                    className="lms-button"
                                    disabled={busy}
                                    onClick={() =>
                                      run(async () => {
                                        await api("progress", {
                                          lesson_id: active.id,
                                          answers: [],
                                        });
                                        setMessage(
                                          "Lesson complete — well done!",
                                        );
                                        await refresh();
                                      })
                                    }
                                  >
                                    Mark lesson complete
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </section>
                    </div>
                  </>
                )
              ))}
          </>
        )}
        {view !== "dashboard" && (
          <footer className="lms-footer">
            <span>Pacific Wave Digital · Learn. Build. Grow.</span>
            <a href="https://wa.me/6785288141">
              Need help? Talk to our training team →
            </a>
          </footer>
        )}
      </div>
    </div>
  );
}
