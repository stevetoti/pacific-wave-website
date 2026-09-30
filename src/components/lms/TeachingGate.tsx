"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";
import { supabase } from "@/lib/supabase";
import TrainingAdmin from "./TrainingAdmin";
// Shows the Teaching workspace to assigned instructors and admins; explains access to everyone else.
export default function TeachingGate() {
  const [state, setState] = useState<"loading" | "signed-out" | "denied" | "ok" | "error">("loading");
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setState("signed-out");
      const r = await authFetch("/api/lms-instructors?scope=me");
      if (!r.ok) return setState(r.status === 401 ? "signed-out" : "error");
      const d = await r.json();
      setState(d.instructor || d.admin ? "ok" : "denied");
    })().catch(() => setState("error"));
  }, []);
  if (state === "ok") return <TrainingAdmin mode="teach" />;
  return (
    <div className="lms">
      <div className="lms-shell">
        <section className="lms-panel">
          <p className="lms-eyebrow">PACIFIC WAVE DIGITAL / TEACHING</p>
          {state === "loading" && <p>Opening your Teaching workspace…</p>}
          {state === "signed-out" && (
            <>
              <h1>Sign in to teach</h1>
              <p>Sign in with the account your invitation was sent to.</p>
              <Link className="lms-button" href="/training-center/account?mode=signin&next=teach">
                Sign in
              </Link>
            </>
          )}
          {state === "denied" && (
            <>
              <h1>You&apos;re not an instructor yet</h1>
              <p>
                This workspace is for Pacific Wave Digital instructors. If you
                should have access, ask the training team to add you to a course.
              </p>
              <Link className="lms-button" href="/training-center/dashboard">
                Go to my dashboard
              </Link>
            </>
          )}
          {state === "error" && (
            <>
              <h1>We couldn&apos;t open the workspace</h1>
              <p>Please refresh the page. If it keeps happening, contact steve@pacificwavedigital.com.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
