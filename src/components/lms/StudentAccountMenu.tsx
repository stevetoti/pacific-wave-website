"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

export default function StudentAccountMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [profile, setProfile] = useState({ full_name: "", avatar_url: "" });
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      authFetch("/api/lms-profile?summary=1").then(async r => {
        if (r.ok && active) setProfile((await r.json()).profile);
      }).catch(() => {});
    };
    refresh();
    window.addEventListener("student-profile-updated", refresh);
    const outside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      active = false;
      window.removeEventListener("student-profile-updated", refresh);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [email]);
  const close = () => { if (menu.current) menu.current.open = false; };
  return <details className="lms-account-menu" ref={menu}>
    <summary aria-label="Open account menu" title="Your account">
      {profile.avatar_url ? <Image src={profile.avatar_url} alt="Your account photo" width={44} height={44} unoptimized /> : <span>{(profile.full_name || email).slice(0, 1).toUpperCase()}</span>}
    </summary>
    <div className="lms-account-dropdown">
      <div className="lms-account-identity"><strong>{profile.full_name || "Your account"}</strong><span>{email}</span></div>
      <Link href="/training-center/dashboard?tab=settings" onClick={close}><Settings size={18} /> Settings</Link>
      <button type="button" onClick={() => { close(); onLogout(); }}><LogOut size={18} /> Log out</button>
    </div>
  </details>;
}
