"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  attendance,
  directions,
  locations,
  feeLabel,
  dateLabel,
  type Cohort,
} from "@/lib/training/config";
import { registrationSchema } from "@/lib/training/schema";

type Values = {
  full_name: string;
  email: string;
  phone: string;
  location_code: string;
  location_other: string;
  area_optional: string;
  attendance_preference: string;
  business_direction: string;
  question: string;
  acknowledged: boolean;
  future_training_opt_in: boolean;
  website: string;
};
const empty: Values = {
  full_name: "",
  email: "",
  phone: "+678 ",
  location_code: "",
  location_other: "",
  area_optional: "",
  attendance_preference: "",
  business_direction: "",
  question: "",
  acknowledged: false,
  future_training_opt_in: false,
  website: "",
};
function track(
  name: "training_form_view" | "training_registration_saved",
  cohort: string,
) {
  if (sessionStorage.getItem("pwd-training-analytics") !== "granted") return;
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", name, { cohort_id: cohort });
}
export default function RegistrationForm({
  cohort: c,
  open,
}: {
  cohort: Cohort;
  open: boolean;
}) {
  const [ready, setReady] = useState(false),
    [values, setValues] = useState(empty),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [error, setError] = useState(""),
    [sending, setSending] = useState(false),
    [reference, setReference] = useState("");
  const [analytics, setAnalytics] = useState(false);
  const requestId = useRef("");
  const locked = useRef(false);
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => {
    requestId.current = crypto.randomUUID();
    setReady(true);
    setAnalytics(
      sessionStorage.getItem("pwd-training-analytics") === "granted",
    );
  }, [c.id]);
  useEffect(() => {
    if (reference) result.current?.focus();
  }, [reference]);
  const set = (key: keyof Values, value: string | boolean) =>
    setValues((v) => ({ ...v, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (locked.current) return;
    setError("");
    const parsed = registrationSchema.safeParse({
      ...values,
      cohort_id: c.id,
      request_id: requestId.current,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      document.getElementById(`training-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    locked.current = true;
    setSending(true);
    setErrors({});
    try {
      const response = await fetch("/api/training/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(
          data.error || "Unable to save your registration. Please try again.",
        );
      setReference(data.reference);
      track("training_registration_saved", c.id);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to connect. Your details are still here; please try again.",
      );
    } finally {
      locked.current = false;
      setSending(false);
    }
  }
  if (!open)
    return (
      <div className="training-form p-8" role="status">
        <h3 className="text-2xl font-bold">Registration is closed</h3>
        <p className="my-4">
          Registration for this class is closed. Contact Pacific Wave Digital
          about your existing registration or future training. No next start
          date has been announced.
        </p>
        <a className="training-button" href={c.whatsapp}>
          Ask on WhatsApp ↗
        </a>
      </div>
    );
  if (reference)
    return (
      <div
        ref={result}
        tabIndex={-1}
        role="status"
        className="training-form p-6 sm:p-10 focus:outline-none"
        data-testid="training-success"
      >
        <span className="text-4xl" aria-hidden>
          ✓
        </span>
        <h3 className="text-2xl font-bold mt-4">
          Thank you — your registration has been received.
        </h3>
        <p className="mt-4">
          Our team will contact you with payment and joining instructions. Your
          course fee is {feeLabel(c)}. Please keep your registration reference:
        </p>
        <p className="font-mono text-sm break-all bg-slate-100 p-4 rounded-lg my-5">
          {reference}
        </p>
        <p>
          Starts {dateLabel(c.start, true)} · {c.daysLabel} · {c.timeLabel}
        </p>
        <p className="mt-3">
          Your preferred attendance:{" "}
          {attendance[values.attendance_preference as keyof typeof attendance]}.
        </p>
        <p className="text-sm mt-4">
          Submitting this form does not take payment or confirm a paid place. If
          you have already registered, our team will follow up; contact us to
          update your details.
        </p>
        <a className="training-button mt-6" href={c.whatsapp}>
          Ask on WhatsApp ↗
        </a>
      </div>
    );
  const field = (
    key: keyof Values,
    label: string,
    type = "text",
    required = false,
    max = 100,
    placeholder = "",
  ) => (
    <div className="training-field">
      <label htmlFor={`training-${key}`}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={`training-${key}`}
        name={key}
        type={type}
        value={String(values[key])}
        onChange={(e) => set(key, e.target.value)}
        required={required}
        maxLength={max}
        placeholder={placeholder}
        autoComplete={
          key === "full_name"
            ? "name"
            : key === "email"
              ? "email"
              : key === "phone"
                ? "tel"
                : "off"
        }
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `error-${key}` : undefined}
      />
      {errors[key] && (
        <span id={`error-${key}`} className="text-red-700 text-sm">
          {errors[key]}
        </span>
      )}
    </div>
  );
  return (
    <form
      className="training-form p-6 sm:p-10"
      onSubmit={submit}
      noValidate
      aria-label="Training registration"
    >
      <fieldset disabled={!ready || sending} className="min-w-0 space-y-5">
        <legend className="sr-only">Your registration details</legend>
        <p className="text-sm text-slate-600">
          Fields marked * are required. No account needed.
        </p>
        {field("full_name", "Full name", "text", true, 120)}
        {field("email", "Email address", "email", true, 254)}
        {field(
          "phone",
          "Best contact number (preferably WhatsApp)",
          "tel",
          true,
          40,
          "+678 528 8141",
        )}
        <p className="!mt-2 text-xs text-slate-600">
          Country code starts at +678. You can change it for an international
          number.
        </p>
        <div className="training-field">
          <label htmlFor="training-location_code">Where are you based? *</label>
          <select
            id="training-location_code"
            value={values.location_code}
            onChange={(e) => set("location_code", e.target.value)}
            required
            aria-invalid={!!errors.location_code}
            aria-describedby={
              errors.location_code ? "error-location_code" : undefined
            }
          >
            <option value="">Select your location</option>
            {Object.entries(locations).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {errors.location_code && (
            <span id="error-location_code" className="text-red-700 text-sm">
              Choose your location.
            </span>
          )}
        </div>
        {["other", "outside"].includes(values.location_code) &&
          field("location_other", "Please specify your location", "text", true)}
        {field("area_optional", "Village / area (optional)")}
        <fieldset
          id="training-attendance_preference"
          tabIndex={-1}
          aria-describedby={
            errors.attendance_preference
              ? "error-attendance_preference"
              : undefined
          }
        >
          <legend className="font-semibold mb-3">
            Attendance preference *
          </legend>
          <div className="space-y-2">
            {Object.entries(attendance).map(([v, l]) => (
              <label className="training-choice" key={v}>
                <input
                  type="radio"
                  name="attendance"
                  value={v}
                  checked={values.attendance_preference === v}
                  onChange={() => set("attendance_preference", v)}
                  required
                />
                {l}
              </label>
            ))}
          </div>
          {errors.attendance_preference && (
            <p
              id="error-attendance_preference"
              className="text-red-700 text-sm"
            >
              Choose your preferred attendance method.
            </p>
          )}
          <p className="text-xs text-slate-600 mt-2">
            For planning; this does not guarantee a reserved venue seat.
          </p>
        </fieldset>
        <div className="training-field">
          <label htmlFor="training-business_direction">
            Business direction (optional)
          </label>
          <select
            id="training-business_direction"
            value={values.business_direction}
            onChange={(e) => set("business_direction", e.target.value)}
          >
            <option value="">Select if you know</option>
            {Object.entries(directions).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="training-field">
          <label htmlFor="training-question">
            Brief question or business idea (optional)
          </label>
          <textarea
            id="training-question"
            rows={3}
            maxLength={500}
            value={values.question}
            onChange={(e) => set("question", e.target.value)}
          />
          <span className="text-xs text-slate-600">
            {values.question.length}/500 characters
          </span>
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="training-website">Leave this empty</label>
          <input
            id="training-website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>
        <div className="border-t pt-5 space-y-4">
          <label className="training-check">
            <input
              id="training-acknowledged"
              type="checkbox"
              checked={values.acknowledged}
              onChange={(e) => set("acknowledged", e.target.checked)}
              required
              aria-invalid={!!errors.acknowledged}
              aria-describedby={
                errors.acknowledged ? "error-acknowledged" : undefined
              }
            />
            <span>
              I understand the course fee is {feeLabel(c)}. Pacific Wave Digital
              may contact me about this registration. I have read the{" "}
              <Link
                href="/privacy#training-registrations"
                className="underline"
                target="_blank"
              >
                Privacy Notice
              </Link>
              . *
            </span>
          </label>
          {errors.acknowledged && (
            <p className="text-red-700 text-sm" id="error-acknowledged">
              {errors.acknowledged}
            </p>
          )}
          <label className="training-check">
            <input
              type="checkbox"
              checked={values.future_training_opt_in}
              onChange={(e) => set("future_training_opt_in", e.target.checked)}
            />
            <span>
              Send me updates about future Pacific Wave Digital training.
              (Optional)
            </span>
          </label>
        </div>
        <p className="text-sm text-slate-600">
          Submitting this form does not take payment or confirm a paid place.
        </p>
        {error && (
          <p role="alert" className="bg-red-50 p-4 rounded-lg text-red-800">
            {error}
          </p>
        )}
        <button
          className="training-button w-full"
          type="submit"
          disabled={!ready || sending}
        >
          {sending ? "Sending…" : "Submit my registration"}
        </button>
      </fieldset>
      <label className="training-check text-xs text-slate-500 mt-6">
        <input
          type="checkbox"
          checked={analytics}
          onChange={(e) => {
            const granted = e.target.checked;
            setAnalytics(granted);
            sessionStorage.setItem(
              "pwd-training-analytics",
              granted ? "granted" : "denied",
            );
            window.dispatchEvent(new Event("training-analytics-consent"));
          }}
        />
        <span>
          Allow anonymous form usage analytics. Optional; no name, email, phone
          or answers are included.
        </span>
      </label>
    </form>
  );
}
