"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
// Unread messages + pending connection requests, for navigation badges.
export function useMessageCounts() {
  const [counts, setCounts] = useState({ unread: 0, requests: 0 });
  useEffect(() => {
    let active = true;
    const load = () =>
      authFetch("/api/lms-messages?summary=1")
        .then(async (r) => {
          if (r.ok && active) setCounts(await r.json());
        })
        .catch(() => {});
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    window.addEventListener("student-messages-updated", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("student-messages-updated", load);
    };
  }, []);
  return counts;
}
