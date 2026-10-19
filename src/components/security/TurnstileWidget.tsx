"use client";

/**
 * Cloudflare Turnstile widget — drops in next to the signup submit button.
 *
 * Two states:
 *   - No site key configured (env var missing): renders nothing. Server-side
 *     server refuses protected signup requests until configuration is fixed.
 *   - Site key configured: loads Cloudflare's script, mounts the widget,
 *     and calls `onVerify(token)` whenever a fresh token is issued. The
 *     parent owns the token and submits it with the rest of the form.
 *
 * The widget auto-resets when its token expires (Turnstile tokens are
 * single-use + expire after 5 minutes), so long-running forms still work.
 */

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
          appearance?: "always" | "execute" | "interaction-only";
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({
  siteKey,
  onVerify,
  theme = "light",
}: {
  siteKey: string | null;
  onVerify: (token: string | null) => void;
  theme?: "light" | "dark" | "auto";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onVerifyRef = useRef(onVerify);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading");

  useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let active = true;
    let widgetId: string | null = null;
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const fail = () => {
      if (!active) return;
      setStatus("error");
      onVerifyRef.current(null);
    };
    // Covers stalled downloads and a challenge that never completes. A retry
    // preserves the parent's form fields and still requires a real fresh token.
    const timeout = window.setTimeout(fail, 30_000);
    const mount = () => {
      if (!active || widgetId !== null || !containerRef.current || !window.turnstile) return;
      try {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size: "flexible",
          appearance: "always",
          callback: (token) => {
            if (!active) return;
            window.clearTimeout(timeout);
            setStatus("verified");
            onVerifyRef.current(token);
          },
          "error-callback": fail,
          "timeout-callback": fail,
          "expired-callback": () => {
            if (!active) return;
            onVerifyRef.current(null);
            setStatus("loading");
            setAttempt(value => value + 1);
          },
        });
      } catch { fail(); }
    };
    const scriptFailed = () => {
      if (script) script.dataset.turnstileFailed = "true";
      fail();
    };
    if (window.turnstile) {
      mount();
    } else {
      // Failed downloads leave a script element behind. Replace it on retry;
      // waiting for its load event again would otherwise deadlock this form.
      if (script?.dataset.turnstileFailed === "true") {
        script.remove();
        script = null;
      }
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", mount);
        script.addEventListener("error", scriptFailed);
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", mount);
        script.addEventListener("error", scriptFailed);
      }
    }
    return () => {
      active = false;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", mount);
      script?.removeEventListener("error", scriptFailed);
      if (widgetId !== null) {
        try { window.turnstile?.remove(widgetId); } catch { /* Already removed. */ }
      }
    };
  }, [siteKey, theme, attempt]);

  if (!siteKey) return null;

  return <div>
    <div ref={containerRef} />
    <p role="status" aria-live="polite">
      {status === "verified" ? "Human verification complete. You can submit the form."
        : status === "error" ? "Human verification could not finish. Retry the check. If it keeps failing, allow challenges.cloudflare.com in your browser or try another connection."
        : "Loading human verification… Please complete the check when it appears."}
    </p>
    {status !== "verified" && <button type="button" className="lms-button secondary" onClick={() => {
      onVerifyRef.current(null);
      setStatus("loading");
      if (!window.turnstile) {
        const script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
        if (script) script.dataset.turnstileFailed = "true";
      }
      setAttempt(value => value + 1);
    }}>Retry human verification</button>}
  </div>;
}
