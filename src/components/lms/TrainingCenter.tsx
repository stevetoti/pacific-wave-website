"use client";
import { liveRecordingPending } from "@/lib/lms/lesson-recording";
import { CourseText, CourseLanguageProvider, CourseLanguagePicker, useCourseLanguage } from '@/components/lms/CourseLanguage';

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
const ZoomClassroom = dynamic(() => import("./ZoomClassroom"), { ssr: false });
const QuizPlayer = dynamic(() => import("./QuizPlayer"));
const StudentDashboard = dynamic(() => import("./StudentDashboard"));
import LessonThumbnail from "./LessonThumbnail";
import NotificationBell from "./NotificationBell";
import PaymentOptions from "./PaymentOptions";
import StudentAccountMenu from "./StudentAccountMenu";
const CourseCommunity = dynamic(() => import("./CourseCommunity"));
const StudentCoaches = dynamic(() => import("./coach/StudentCoaches"), { ssr: false });
import WorkshopResources from "./WorkshopResources";
const DigitalWorkbook = dynamic(() => import("./DigitalWorkbook"));
import ProgramDetail from "./ProgramDetail";
import { blpSlug, blpModules, workshopRecordingPending } from "@/lib/lms/blp-workshop";
import { programs, mentorshipSlug } from "@/lib/lms/programs";
const base = "/training-center";
function classImage(course: Course, lesson: Lesson, index: number) {
  return lesson.thumbnail_url || (course.slug === blpSlug && blpModules[index] ? `/images/training/blp/scene-0${blpModules[index].image}.webp` : undefined) || (course.slug === "vanuatu-october-2026" && index >= 0 && index < 12 ? `/images/training/classes/class-${String(index+1).padStart(2,"0")}.webp` : undefined);
}
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
const when = (s: string, language = "en") =>
  new Date(s).toLocaleString(language === "fr" ? "fr-FR" : "en-GB", {
    timeZone: "Pacific/Efate",
    weekday: language === "bi" ? undefined : "short",
    day: "numeric",
    month: language === "bi" ? "numeric" : "short",
    hour: "2-digit",
    minute: "2-digit",
  });
function TrainingCenterContent({
  path,
  query,
  initialCourses,
}: {
  initialCourses?: Course[];
  path: string[];
  query: Record<string, string | undefined>;
}) {
  const { t, language } = useCourseLanguage();
  const router = useRouter();
  const view = path[0] || "catalog";
  const coursePathId = path[1];
  const [showFaculty, setShowFaculty] = useState(false);
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
    [authReady, setAuthReady] = useState(false),
    [ready, setReady] = useState(Boolean(initialCourses) || view === "account"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [orders, setOrders] = useState<Order[]>([]),
    [progress, setProgress] = useState<Progress[]>([]),
    [lessons, setLessons] = useState<Lesson[]>([]),
    [active, setActive] = useState<Lesson | null>(null),
    [current, setCurrent] = useState<Course | null>(null),
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
    if (publicPage && initialCourses) setCourses(initialCourses);
    const needsCatalog =
      !["account", "course"].includes(view) && (!publicPage || !initialCourses);
    const [catalog, auth, selected] = await Promise.all([
      needsCatalog ? api("catalog") : Promise.resolve(null),
      supabase.auth.getSession(),
      query.course && ["account", "checkout"].includes(view)
        ? api(`registration_course?course=${encodeURIComponent(query.course)}`) : Promise.resolve(null),
    ]);
    if (catalog) {
      setCourses(catalog.courses);
      setSandbox(catalog.sandbox);
      setBanks(catalog.banks);
      setCard(catalog.stripe);
    }
    if (selected) setCourses(previous => [...previous.filter(c => c.id !== selected.course.id), selected.course]);
    const {
      data: { session },
    } = auth;
    setEmail(session?.user.email || null);
    setAuthReady(true);
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
  }, [view, coursePathId, initialCourses, query.course]);
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
      setAuthReady(true);
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
      query.next &&
      /^[a-z_]{2,30}$/.test(query.next) &&
      !query.course &&
      !query.verify &&
      !["reset", "update"].includes(authMode)
    ) {
      router.replace(
        query.next === "teach"
          ? `${base}/teach`
          : `${base}/dashboard?tab=${query.next}`,
      );
    } else if (
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
      authReady &&
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
    authReady,
    query.course,
    query.next,
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
  useEffect(() => {
    if (view === "checkout" && checkout?.amount === 0 && order && (checkout.requires_approval || ["paid", "granted"].includes(order.status)))
      router.replace(`${base}/course/${checkout.id}`);
  }, [view, checkout?.id, checkout?.amount, checkout?.requires_approval, order, router]);
  // Affiliate sign-ups need no course; they land on the application after signing in.
  const forAffiliate = query.next === "affiliate" && !queryCourse;
  // `next` names the dashboard tab to return to after signing in.
  const nextTab = query.next && /^[a-z_]{2,30}$/.test(query.next) ? query.next : null;
  const afterAuth = queryCourse
    ? `${base}/checkout?course=${encodeURIComponent(queryCourse)}`
    : query.next === "teach"
      ? `${base}/teach`
      : nextTab
      ? `${base}/dashboard?tab=${nextTab}`
      : `${base}/dashboard`;
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
        {view === "course" && <CourseLanguagePicker />}
        <nav className="lms-nav" aria-label="Training navigation">
          <Link href={base} className="lms-brand">
            <Image
              src="/images/training/pwd-logo.png"
              width={44}
              height={44}
              alt="Pacific Wave Digital"
            />
            <span><CourseText text={"TRAINING CENTRE"} /><small><CourseText text={"Pacific Wave Digital"} /></small>
            </span>
          </Link>
          <div>
            <Link href="/"><CourseText text={"Main website"} /></Link>
            <Link href={base}><CourseText text={"Explore courses"} /></Link>
            <Link
              href={
                email
                  ? `${base}/dashboard`
                  : `${base}/account?mode=signin`
              }
            >
              {t(email ? "My dashboard" : "Sign in")}
            </Link>
          </div>
          {email && (
            <div className="lms-nav-actions">
            <NotificationBell />
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
            </div>
          )}
        </nav>
        {sandbox && (
          <div className="lms-notice"><CourseText text={"Preview mode: registration emails go to a test inbox. Your review here will not trigger a real card charge."} /></div>
        )}
        {error && (
          <div className="lms-alert" role="alert">
            {error} <button onClick={() => run(refresh)}><CourseText text={"Try again"} /></button>
          </div>
        )}
        {message && (
          <div className="lms-notice" role="status">
            {message}
          </div>
        )}
        {!ready ? (
          <p className="lms-panel"><CourseText text={"Loading your training centre…"} /></p>
        ) : (
          <>
            {view === "catalog" && (
              <>
                <section className="lms-hero">
                  <div>
                    <p className="lms-eyebrow"><CourseText text={"LEARN HERE. BUILD WHAT’S NEXT."} /></p>
                    <h1><CourseText text={"Your next chapter"} /><br />
                      <em><CourseText text={"starts with a skill."} /></em>
                    </h1>
                    <p><CourseText text={"Practical learning for people building businesses in Vanuatu and across the Pacific. Join a live class. Learn at your pace. Put it into practice."} /></p>
                    <a className="lms-button" href="#courses"><CourseText text={"Find your course"} /><ArrowRight size={18} />
                    </a>
                    <div className="lms-hero-facts">
                      <span>
                        <GraduationCap /><CourseText text={"Practical projects"} /></span>
                      <span>
                        <PlayCircle /><CourseText text={"Class replays"} /></span>
                      <span>
                        <CalendarDays /><CourseText text={"Live & self-paced"} /></span>
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
                      <span className="lms-dot" /><CourseText text={"OCTOBER COHORT"} /><small><CourseText text={"Start 5 October · Vanuatu"} /></small>
                    </div>
                  </div>
                </section>
                <section id="courses" className="lms-section">
                  <div className="lms-section-head">
                    <div>
                      <p className="lms-eyebrow"><CourseText text={"YOUR LEARNING JOURNEY"} /></p>
                      <h2><CourseText text={"Find your next course"} /></h2>
                    </div>
                    <p><CourseText text={"Real skills. A clear path forward."} /></p>
                  </div>
                  <div className="lms-grid lms-catalog-grid">
                    {courses.filter(c => !c.is_private).map((c) => (
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
                            {t(c.private_sessions
                              ? "PERSONAL GUIDANCE"
                              : c.kind === "live"
                                ? "LEARN TOGETHER"
                                : "LEARN AT YOUR PACE")}
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
                                {t(!c.enrollment_open
                                  ? "Details to be announced"
                                  : c.slug === mentorshipSlug
                                    ? "Total for 3 months"
                                    : "One-time course fee")}
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
                              {t(c.cohort_id ? "Register" : "View course")}
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
                    <h2><CourseText text={"A learning space that stays with you."} /></h2>
                    <p><CourseText text={"Your classes, recordings, quizzes and progress — together in your personal dashboard."} /></p>
                  </div>
                  <Link href={`${base}/dashboard`}><CourseText text={"Open my dashboard →"} /></Link>
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
                  <h1><CourseText text={"Course unavailable"} /></h1>
                  <Link href={base}><CourseText text={"Explore courses"} /></Link>
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
                    <GraduationCap size={18} aria-hidden="true" /><CourseText text={"YOUR FUTURE STARTS HERE"} /></span>
                  <div className="lms-auth-story">
                    <span className="lms-auth-accent" />
                    <h2><CourseText text={"Build your skills."} /><br /><CourseText text={"Create your future."} /></h2>
                    <p><CourseText text={"Learn alongside people with ideas, ambition and the courage to take the next step."} /></p>
                    <div className="lms-auth-benefits">
                      <span>
                        <BookOpen size={16} aria-hidden="true" /><CourseText text={"Practical learning"} /></span>
                      <span>
                        <PlayCircle size={16} aria-hidden="true" /><CourseText text={"Class recordings"} /></span>
                    </div>
                  </div>
                </aside>
                <div className="lms-auth-form">
                  <p className="lms-auth-kicker"><CourseText text={"PACIFIC WAVE DIGITAL · TRAINING CENTRE"} /></p>

                  {authMode === "signup" && queryCourse && checkout && (
                    <div className="lms-notice">
                      <strong>{checkout.title}</strong>
                      <p>
                        {checkout.requires_approval ? "Free registration · Admin approval required" : checkout.amount === 0 ? "Participant access included" : `${money(checkout.amount, checkout.currency)} · One-time course fee`}
                      </p>
                    </div>
                  )}
                  <h1>
                    {t(authMode === "signup"
                      ? forAffiliate
                        ? "Create your free affiliate account"
                        : "Create your student account"
                      : authMode === "reset"
                        ? "Reset your password"
                        : authMode === "update"
                          ? "Choose a new password"
                          : "Welcome back")}
                  </h1>
                  <p>
                    {t(authMode === "signup" && forAffiliate
                      ? "Free to join. You don't need to buy a course. Next, you'll apply to the affiliate programme."
                      : authMode === "signup"
                      ? checkout?.requires_approval ? "Register for free. Our team will approve your workshop access after checking participant eligibility." : "Register once, then choose how to pay. No email confirmation needed."
                      : "Your courses, class recordings and learning progress in one place.")}
                  </p>
                  {accountEmail && (
                    <div className="lms-notice">
                      <p><CourseText text={"Account email:"} /><strong>{accountEmail}</strong>
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
                      ><CourseText text={"Resend access email"} /></button>
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
                            router.push(afterAuth);
                          }
                        })
                      }
                    ><CourseText text={"Confirm"} />{" "}
                      {t(verifyType === "recovery"
                        ? "password reset"
                        : "email address")}
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
                            attendance: f.get("attendance") || "online",
                            acknowledged: f.get("privacy") === "on",
                            mode: "signup",
                            course: queryCourse || undefined,
                            intent: forAffiliate ? "affiliate" : undefined,
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
                        router.push(afterAuth);
                      });
                    }}
                  >
                    <fieldset disabled={busy}>
                      {authMode === "signup" && (
                        <>
                          <label><CourseText text={"Full name"} /><input
                              name="name"
                              autoComplete="name"
                              minLength={2}
                              maxLength={120}
                              required
                            />
                          </label>
                          <label><CourseText text={"Phone / WhatsApp"} /><input
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="+678 …"
                              minLength={5}
                              maxLength={40}
                              required
                            />
                          </label>
                          <label><CourseText text={"Location (town, island or country)"} /><input
                              name="location"
                              autoComplete="address-level2"
                              placeholder="e.g. Port Vila, Efate"
                              minLength={2}
                              maxLength={100}
                              required
                            />
                          </label>
                          {!forAffiliate && (
                          <label><CourseText text={"How would you like to attend?"} /><select name="attendance" required defaultValue="">
                              <option value="" disabled><CourseText text={"Choose your attendance"} /></option>
                              <option value="online"><CourseText text={"Online"} /></option>
                              <option value="in_person"><CourseText text={"In person (physical class)"} /></option>
                              <option value="mixed"><CourseText text={"A mix of both"} /></option>
                            </select>
                          </label>
                          )}
                        </>
                      )}
                      {authMode !== "update" && (
                        <label><CourseText text={"Email address"} /><input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                          />
                        </label>
                      )}
                      {authMode !== "reset" && (
                        <label><CourseText text={"Password"} /><input
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
                          <input name="privacy" type="checkbox" required /><CourseText text={"I agree to the"} />{" "}
                          <Link href="/privacy#training-registrations"><CourseText text={"training privacy notice"} /></Link><CourseText text={"."} /></label>
                      )}
                      <button className="lms-button">
                        {t(busy
                          ? "Please wait…"
                          : authMode === "signup"
                            ? queryCourse
                              ? checkout?.requires_approval ? "Register for approval" : "Register & continue to payment"
                              : "Create my account"
                            : authMode === "reset"
                              ? "Send reset email"
                              : authMode === "update"
                                ? "Save password"
                                : "Sign in")}
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
                      {t(authMode === "signup"
                        ? "Already a student? Sign in"
                        : "New here? Create an account")}
                    </button>
                    {authMode === "signin" && (
                      <button onClick={() => setAuthMode("reset")}><CourseText text={"Forgot password?"} /></button>
                    )}
                  </div>
                  <p className="lms-auth-reassurance">
                    <ShieldCheck size={16} aria-hidden="true" /><CourseText text={"Your personal space to learn and grow."} /></p>
                </div>
              </section>
            )}
            {view === "checkout" &&
              (!checkout || (!checkout.enrollment_open && !order)) && (
                <section className="lms-panel">
                  <h1><CourseText text={"Course unavailable"} /></h1>
                  <p><CourseText text={"This course is not currently accepting registrations."} /></p>
                  <Link href={base}><CourseText text={"Explore available courses →"} /></Link>
                </section>
              )}
            {view === "checkout" &&
              checkout &&
              (checkout.enrollment_open || order) && (
                <>
                  <header className="lms-page-head">
                    <p className="lms-eyebrow"><CourseText text={"YOUR NEXT STEP"} /></p>
                    <h1><CourseText text={"Join the course"} /></h1>
                    <p>{t(checkout.requires_approval ? "Register for free. Our team will confirm you are a workshop participant before opening learning and chat access." : "Pay by bank transfer or card to complete your enrolment. We’ll guide you step by step.")}</p>
                  </header>
                  <div className="lms-two lms-checkout">
                    <section className="lms-panel lms-checkout-course">
                      <h2>{checkout.title}</h2>
                      <p>{checkout.description}</p>
                      <div className="lms-price">
                        {money(
                          order?.amount ?? checkout.amount,
                          order?.currency ?? checkout.currency,
                        )}
                      </div>
                      <p>
                        {t(checkout.requires_approval ? "No payment required · Administrator approval needed" : checkout.private_sessions
                          ? "One-time fee for all 3 months"
                          : "One-time course fee")}
                      </p>
                      {checkout.cohort_id && (
                        <>
                          <hr />
                          <p>
                            <strong><CourseText text={"12 live classes · 24 teaching hours"} /></strong>
                            <br /><CourseText text={"5–31 October · Mon, Thu & Sat"} /><br /><CourseText text={"3–5 pm Vanuatu time (UTC+11)"} /></p>
                          <p><CourseText text={"Yumiwork, Nambatu, near Kaiviti Motel, or online."} /></p>
                          <p><CourseText text={"Includes three free months of Digi Assist AI Pro and one additional mentorship month. Continued Pro use requires a paid subscription after the free period."} /></p>
                        </>
                      )}
                      <Link
                        href={
                          checkout.cohort_id
                            ? "/vanuatu-training"
                            : `${base}/programs/${checkout.slug}`
                        }
                      ><CourseText text={"Read the full course details →"} /></Link>
                      {checkout.private_sessions && (
                        <p><CourseText text={"Includes building one software project during the programme and three free months of Digi Assist AI Pro. Continued Pro use after the free period requires a paid subscription. Sessions are arranged with your mentor, with private recordings for your enrolment."} /></p>
                      )}
                    </section>
                    <section className="lms-panel lms-checkout-pay">
                      {!email ? (
                        <>
                          <h2><CourseText text={"Start with your student account"} /></h2>
                          <p><CourseText text={"Sign in or create an account to save your registration and access your dashboard."} /></p>
                          <Link className="lms-button" href={authUrl}><CourseText text={"Register to join"} /><ArrowRight size={18} />
                          </Link>
                        </>
                      ) : !order ? (
                        <>
                          <h2><CourseText text={"Your registration details"} /></h2>
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
                              <label><CourseText text={"Full name"} /><input
                                  name="name"
                                  required
                                  minLength={2}
                                  maxLength={120}
                                  autoComplete="name"
                                />
                              </label>
                              <label><CourseText text={"Phone / WhatsApp"} /><input
                                  name="phone"
                                  type="tel"
                                  required
                                  minLength={5}
                                  maxLength={40}
                                  defaultValue="+678 "
                                  autoComplete="tel"
                                />
                              </label>
                              <label><CourseText text={"How will you attend?"} /><select name="attendance">
                                  <option value="online"><CourseText text={"Online"} /></option>
                                  <option value="in_person"><CourseText text={"In person"} /></option>
                                  <option value="mixed"><CourseText text={"A mix of both"} /></option>
                                </select>
                              </label>
                              <label className="lms-check">
                                <input type="checkbox" required />{t(checkout.requires_approval ? "I understand that workshop access requires approval and have read the" : "I understand the course fee and have read the")}{" "}
                                <Link href="/privacy#training-registrations"><CourseText text={"privacy notice"} /></Link><CourseText text={"."} /></label>
                              <button className="lms-button"><CourseText text={"Save registration & continue"} />{" "}
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
                            {t(["paid", "granted"].includes(order.status)
                              ? "You’re enrolled!"
                              : order.status === "revoked"
                                ? "Your access has been removed"
                                : "Your proof is under review")}
                          </h2>
                          <p>
                            {t(["paid", "granted"].includes(order.status)
                              ? "Your course is ready in your dashboard."
                              : order.status === "revoked"
                                ? "Please contact steve@pacificwavedigital.com if you need help with your package."
                                : "You can explore your introduction and timetable now. Paid lessons unlock after we verify your transfer.")}
                          </p>
                          <Link
                            className="lms-button"
                            href={`${base}/course/${checkout.id}`}
                          ><CourseText text={"Go to my course"} /><ArrowRight size={18} />
                          </Link>
                        </>
                      ) : (
                        <>
                          <h2 className="pay-title"><CourseText text={"How to pay"} /></h2>
                          <PaymentOptions
                            order={order}
                            courseTitle={checkout.title}
                            banks={banks}
                            cardEnabled={card}
                            busy={busy}
                            onCoupon={(code) =>
                              run(async () => {
                                await api("coupon", { id: order.id, code });
                                setMessage(
                                  "Coupon applied. Your payment total has been updated.",
                                );
                                await refresh();
                              })
                            }
                            onCard={() =>
                              run(async () => {
                                const data = await api("checkout", {
                                  id: order.id,
                                });
                                window.location.assign(data.url);
                              })
                            }
                            onProof={(bank, file) =>
                              run(async () => {
                                if (file.size > 3145728)
                                  throw new Error(
                                    "Choose a file smaller than 3 MB.",
                                  );
                                const r = await authFetch(
                                  `/api/lms/proof?id=${order.id}&bank=${encodeURIComponent(bank)}`,
                                  { method: "POST", body: file },
                                );
                                const data = await r.json();
                                if (!r.ok) throw new Error(data.error);
                                router.push(`${base}/course/${checkout.id}`);
                              })
                            }
                          />
                          <Link href={`${base}/course/${checkout.id}`}><CourseText text={"View introduction and schedule →"} /></Link>
                        </>
                      )}
                    </section>
                  </div>
                </>
              )}
            {view === "dashboard" &&
              (!email ? (
                <div className="lms-panel">
                  <h1>
                    {t(query.tab === "affiliate"
                      ? "Sign in to your affiliate dashboard"
                      : "Your learning space is waiting")}
                  </h1>
                  <p>
                    {t(query.tab === "affiliate"
                      ? "Sign in with the email and password you used to apply. You don't need to be enrolled in a course."
                      : "Sign in to see your courses, affiliate earnings, profile and purchase history.")}
                  </p>
                  <Link
                    className="lms-button"
                    href={`${base}/account?mode=signin&next=${query.tab && /^[a-z_]{2,30}$/.test(query.tab) ? query.tab : "overview"}`}
                  ><CourseText text={"Sign in to your dashboard"} /></Link>{" "}
                  <Link
                    className="lms-text"
                    href={`${base}/account?mode=signup&next=${query.tab === "affiliate" ? "affiliate" : "overview"}`}
                  ><CourseText text={"New here? Create a free account"} /></Link>
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
                  <h1><CourseText text={"Sign in to your course"} /></h1>
                  <Link className="lms-button" href={`${base}/account`}><CourseText text={"Student sign in"} /></Link>
                </div>
              ) : (
                current && (
                  <>
                    <header className="lms-page-head">
                      <Link href={`${base}/dashboard`}><CourseText text={"← My learning"} /></Link>
                      <p className="lms-eyebrow">
                        {t(current.kind === "live"
                          ? "YOUR LIVE COHORT"
                          : "YOUR RECORDED COURSE")}
                      </p>
                      {current.slug === blpSlug && <Image src="/images/training/blp/logo.png" alt="Business Link Pacific" width={180} height={115} />}
                      <h1>{t(current.title)}</h1>
                      <p>
                        {
                          progress.filter((p) =>
                            lessons.some((l) => l.id === p.lesson_id),
                          ).length
                        }{" "}<CourseText text={"of"} />{lessons.length}<CourseText text={"lessons completed"} /></p>
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
                          : current.requires_approval ? (courseOrder?.status === "revoked" ? "Your workshop access has been removed. Contact the team if you need help." : "Awaiting approval. Our team will confirm you are a workshop participant before opening lessons, resources, AI coaches and chat. No payment is required.") : "Complete payment to unlock published lessons."}{" "}<CourseText text={"Your introduction and timetable are available now."} />{" "}
                        <Link href={`${base}/checkout?course=${current.id}`}>
                          {t(current.requires_approval ? "Registration details →" : "Payment details →")}
                        </Link>
                      </div>
                    )}
                    {current.slug === blpSlug && ["paid", "granted"].includes(courseOrder?.status || "") && <WorkshopResources />}
                    {current.slug === "vanuatu-october-2026" && ["paid", "granted"].includes(courseOrder?.status || "") && <DigitalWorkbook key={current.id} courseId={current.id} />}
                    <nav
                      className="lms-admin-tabs"
                      aria-label="Course sections"
                    >
                      <button
                        className={courseTab === "lessons" ? "selected" : ""}
                        onClick={() => setCourseTab("lessons")}
                      ><CourseText text={"Lessons & recordings"} /></button>
                      <button
                        className={courseTab === "community" ? "selected" : ""}
                        onClick={() => setCourseTab("community")}
                      >
                        {t(current.private_sessions
                          ? "Private mentor chat"
                          : "Community & groups")}
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
                        <h2><CourseText text={"Course journey"} /></h2>
                        <button
                          className={`lms-lesson ${!active && !showFaculty ? "selected" : ""}`}
                          onClick={() => {setActive(null);setShowFaculty(false);}}
                        >
                          <BookOpen size={18} /><CourseText text={"Start here: introduction"} /></button>
                        <button className={`lms-lesson lms-faculty-nav ${showFaculty ? "selected" : ""}`} onClick={()=>setShowFaculty(true)}><GraduationCap size={20}/><span><CourseText text={"Meet your AI Faculty"} /><small><CourseText text={"Start with your onboarding tutor"} /></small></span></button>
                        <Link className="lms-lesson" href={`/training-center/sessions?course=${current.id}`}><BookOpen size={18}/><CourseText text={"My coaching conversations"} /></Link>
                        {lessons.map((l, i) => (
                          <button
                            className={`lms-lesson lms-lesson-with-image ${!showFaculty && active?.id === l.id ? "selected" : ""}`}
                            key={l.id}
                            onClick={() => {setActive(l);setShowFaculty(false);}}
                          >
                            <LessonThumbnail url={classImage(current,l,i)} />
                            <span className="lms-lesson-copy">
                              {l.section_title && (
                                <small>{t(l.section_title)}</small>
                              )}
                              {progress.some((p) => p.lesson_id === l.id)
                                ? "✓ "
                                : `${i + 1}. `}
                              {t(l.title)}
                              <small>
                                {l.starts_at
                                  ? when(l.starts_at, language)
                                  : current.private_sessions
                                    ? t("Time arranged with your mentor")
                                    : t("Learn at your pace")}
                                {t(!l.published ? " · Coming soon" : "")}
                              </small>
                            </span>
                          </button>
                        ))}
                        {lessons.some((l) => l.starts_at) && (
                          <button className="lms-text" onClick={calendar}>
                            <CalendarDays size={16} /><CourseText text={"Add classes to calendar"} /></button>
                        )}
                      </aside>
                      <section className="lms-panel lms-content">
                        {["paid", "granted"].includes(courseOrder?.status || "") && <StudentCoaches key={current.id} visible={showFaculty} courseId={current.id} lessonId={active?.published ? active.id : null} lessonTitle={active?.published ? active.title : null} />}
                        <div hidden={showFaculty}>
                        {!active ? (
                          <>
                            <div className="lms-welcome-image"><Image src={programs[current.slug]?.image || "/images/training/hero.webp"} alt="Students learning together in a live Pacific Wave Digital training session" fill sizes="(max-width: 700px) 90vw, 65vw" priority/><span><CourseText text={"YOUR NEXT CHAPTER STARTS HERE"} /></span></div>
                            <p className="lms-eyebrow"><CourseText text={"START HERE"} /></p>
                            <h2><CourseText text={"Welcome to your course"} /></h2>
                            <div className="lms-prose">
                              {t(current.introduction)}
                            </div>
                            <div className="lms-discover-grid">
                              <button onClick={()=>setShowFaculty(true)}><Image src="/images/coaches/onboarding.webp" alt="A student meeting an AI tutor" width={640} height={360}/><span><small><CourseText text={"YOUR FIRST STEP"} /></small><strong><CourseText text={"Meet your AI Faculty"} /></strong><p><CourseText text={"Get oriented, ask questions and turn your learning into practical action."} /></p><b><CourseText text={"Choose your coach →"} /></b></span></button>
                              <Link href={`/training-center/sessions?course=${current.id}`}><Image src="/images/coaches/project_review.webp" alt="Reviewing a project with a coach" width={640} height={360}/><span><small><CourseText text={"YOUR PERSONAL LIBRARY"} /></small><strong><CourseText text={"Conversations & research"} /></strong><p><CourseText text={"Revisit sessions, rename them and download your researched learning guides."} /></p><b><CourseText text={"Open your session library →"} /></b></span></Link>
                              <button onClick={()=>{if(lessons[0])setActive(lessons[0]);}}><Image src={classImage(current,lessons[0]||{} as Lesson,0)||"/images/training/hero.webp"} alt="Live course training" width={640} height={360}/><span><small><CourseText text={"LEARN & PRACTISE"} /></small><strong><CourseText text={"Live classes & recordings"} /></strong><p><CourseText text={"Follow your timetable. Find each recording and activity here after publication."} /></p><b><CourseText text={"Explore your lessons →"} /></b></span></button>
                              <button onClick={()=>setCourseTab("community")}><Image src="/images/training/hero.webp" alt="A supportive group of learners" width={640} height={360}/><span><small><CourseText text={"STAY CONNECTED"} /></small><strong>{t(current.private_sessions?"Your mentor space":"Your learning community")}</strong><p><CourseText text={"Ask course questions and stay connected with your training team."} /></p><b><CourseText text={"Open your community →"} /></b></span></button>
                            </div>
                            <div className="lms-bank">
                              <h3><CourseText text={"Make the most of your learning"} /></h3>
                              <p><CourseText text={"Set aside time to practise. Bring your questions to class. Return here for recordings and quizzes after each session."} /></p>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="lms-eyebrow">
                              {active.starts_at
                                ? `${when(active.starts_at, language)} · VANUATU TIME`
                                : "ON-DEMAND LESSON"}
                            </p>
                            {classImage(current,active,lessons.findIndex(l=>l.id===active.id)) && (
                              <LessonThumbnail
                                url={classImage(current,active,lessons.findIndex(l=>l.id===active.id))}
                                cover
                                locked={workshopRecordingPending(current, active)}
                              />
                            )}
                            <h2>{t(active.title)}</h2>
                            {active.published && active.meeting_url && ["paid", "granted"].includes(courseOrder?.status || "") && (
                              <ZoomClassroom key={active.id} lessonId={active.id} meetingUrl={active.meeting_url} title={t(active.title)} courseTitle={t(current.title)} artwork={classImage(current, active, lessons.findIndex(l => l.id === active.id)) || programs[current.slug]?.image || "/images/training/hero.webp"} schedule={active.starts_at ? when(active.starts_at, language) : undefined} classNumber={active.position} />
                            )}
                            {!["paid", "granted"].includes(
                              courseOrder?.status || "",
                            ) ? (
                              <div className="lms-empty">
                                <LockKeyhole size={36} />
                                <h3><CourseText text={"Unlock your learning"} /></h3>
                                <p>
                                  {t(current.requires_approval ? "Your workshop learning access opens after administrator approval." : "This lesson becomes available after payment is verified.")}
                                </p>
                              </div>
                            ) : workshopRecordingPending(current, active) ? (
                              <div className="lms-workshop-recording-notice">
                                <h3><CourseText text={"Video available after training"} /></h3>
                                <p><CourseText text={"Your instructor will upload the video after the training. Return to this topic once the recording has been published."} /></p>
                                <p className="lms-muted"><CourseText text={"You can explore the workshop outline and participant workbook in your course dashboard while you wait."} /></p>
                              </div>
                            ) : liveRecordingPending(active) ? (
                              <div className="lms-workshop-recording-notice">
                                <h3><CourseText text={"Video available after training"} /></h3>
                                <p><CourseText text={"Your instructor will upload the video after the training. Return to this topic once the recording has been published."} /></p>
                              </div>
                            ) : !active.published ? (
                              <div className="lms-empty">
                                <Clock3 size={36} />
                                <h3><CourseText text={"Your next class is on the way"} /></h3>
                                <p>
                                  {active.starts_at ? t("This class is scheduled for {date} (Vanuatu time). Its recording will be available after the class, once published by your trainer.").replace("{date}", when(active.starts_at, language)) : t("Class materials and recordings will appear here when your trainer publishes them.")}
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
                                      {t(recordingUrl?.id === active.id
                                        ? "Refresh recording link"
                                        : "Play your private recording")}
                                    </button>
                                    {recordingUrl?.id === active.id && (
                                      <video
                                        key={recordingUrl.url}
                                        className="lms-video"
                                        controls
                                        preload="metadata"
                                        controlsList="nodownload"
                                        src={recordingUrl.url}
                                      ><CourseText text={"Your browser does not support video playback."} /></video>
                                    )}
                                  </>
                                )}
                                {active.youtube_id &&
                                  playVideo !== active.id && (
                                    <button
                                      className="lms-button"
                                      onClick={() => setPlayVideo(active.id)}
                                    >
                                      <PlayCircle size={18} /><CourseText text={"Load class recording"} /></button>
                                  )}
                                {active.youtube_id &&
                                  playVideo === active.id && (
                                    <iframe
                                      className="lms-video"
                                      src={`https://www.youtube-nocookie.com/embed/${active.youtube_id}`}
                                      title={t(active.title)}
                                      allow="encrypted-media; picture-in-picture; fullscreen"
                                      allowFullScreen
                                      loading="lazy"
                                    />
                                  )}
                                <div className="lms-prose">
                                  {t(active.content)}
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
                                  ><CourseText text={"Mark lesson complete"} /></button>
                                )}
                              </>
                            )}
                          </>
                        )}
                        </div>
                      </section>
                    </div>
                  </>
                )
              ))}
          </>
        )}
        {view !== "dashboard" && (
          <footer className="lms-footer">
            <span><CourseText text={"Pacific Wave Digital · Learn. Build. Grow."} /></span>
            <a href="https://wa.me/6785288141"><CourseText text={"Need help? Talk to our training team →"} /></a>
          </footer>
        )}
      </div>
    </div>
  );
}

export default function TrainingCenter(props: Parameters<typeof TrainingCenterContent>[0]) {
 return <CourseLanguageProvider enabled={props.path[0] === "course"}><TrainingCenterContent {...props}/></CourseLanguageProvider>;
}
