"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";
import type { StudentProfile } from "@/lib/lms/profile";
// Instructors edit the public part of their profile shown on course pages and in chat.
export default function InstructorProfileForm() {
  const [profile, setProfile] = useState<StudentProfile | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    authFetch("/api/lms-profile")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setProfile(d.profile);
      })
      .catch((e) => setError(e.message));
  }, []);
  if (!profile)
    return <section className="lms-panel">{error ? <p className="lms-alert">{error}</p> : "Loading your profile…"}</section>;
  return (
    <form
      className="lms-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const next = {
          ...profile,
          full_name: String(f.get("full_name") || ""),
          instructor_title: String(f.get("instructor_title") || ""),
          expertise: String(f.get("expertise") || ""),
          bio: String(f.get("bio") || ""),
        };
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const r = await authFetch("/api/lms-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
          const d = await r.json();
          if (!r.ok) throw Error(d.error || "Could not save your profile.");
          setProfile(next);
          setMessage("Instructor profile saved. Students see it on your course pages.");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save your profile.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>My instructor profile</h2>
      <p>Students see your photo, name, title, expertise and bio on your course pages and in chat.</p>
      {error && <p className="lms-alert" role="alert">{error}</p>}
      {message && <p className="lms-notice" role="status">{message}</p>}
      <div className="in-profile-photo">
        {profile.avatar_url ? (
          <Image src={profile.avatar_url} alt="Your photo" width={72} height={72} unoptimized />
        ) : (
          <span>{(profile.full_name || "?").slice(0, 1).toUpperCase()}</span>
        )}
        <Link href="/training-center/dashboard?tab=profile">Change photo →</Link>
      </div>
      <fieldset disabled={busy}>
        <label>
          Full name
          <input name="full_name" required minLength={2} maxLength={120} defaultValue={profile.full_name} />
        </label>
        <label>
          Title
          <input name="instructor_title" maxLength={120} defaultValue={profile.instructor_title} placeholder="e.g. Lead Instructor, Web Development" />
        </label>
        <label>
          Areas of expertise
          <input name="expertise" maxLength={300} defaultValue={profile.expertise} placeholder="e.g. AI tools, websites, digital marketing" />
        </label>
        <label>
          Short bio
          <textarea name="bio" maxLength={1000} defaultValue={profile.bio} placeholder="Your experience and how you help students succeed." />
        </label>
        <button className="lms-button">Save profile</button>
      </fieldset>
    </form>
  );
}
