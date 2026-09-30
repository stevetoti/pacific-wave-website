"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, UserPlus, UserCheck, AtSign, Megaphone, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
type Item = {
  id: string;
  kind: "message" | "connection_request" | "connection_accepted" | "mention" | "announcement";
  group_key: string;
  title: string;
  body: string;
  link: string;
  count: number;
  updated_at: string;
  read_at: string | null;
  actor: { full_name: string; avatar_url: string } | null;
};
const icons = { message: MessageCircle, connection_request: UserPlus, connection_accepted: UserCheck, mention: AtSign, announcement: Megaphone };
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
};
const describe = (i: Item) =>
  i.kind === "message" && i.count > 1 ? `${i.count} new messages · ${i.body}` : i.body;
// Soft two-note chime generated in the browser (no audio file). Browsers may block it until the page has been clicked.
function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    /* Sound is optional. */
  }
}
function Avatar({ item }: { item: Item }) {
  const Icon = icons[item.kind];
  return (
    <span className="nb-avatar">
      {item.actor?.avatar_url ? (
        <Image src={item.actor.avatar_url} alt="" width={40} height={40} unoptimized />
      ) : (
        <span>{(item.actor?.full_name || "P").slice(0, 1).toUpperCase()}</span>
      )}
      <i><Icon size={11} /></i>
    </span>
  );
}
export default function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<Item | null>(null);
  const seen = useRef<Map<string, number> | null>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const load = useCallback(async () => {
    const r = await authFetch("/api/lms-notifications");
    if (!r.ok) return;
    const d = (await r.json()) as { unread: number; items: Item[] };
    setItems(d.items);
    setUnread(d.unread);
    const first = seen.current === null;
    const map = seen.current || new Map<string, number>();
    const active = document.body.dataset.activeThread;
    let fresh: Item | null = null;
    for (const i of d.items) {
      if (!i.read_at && (map.get(i.id) || 0) < i.count && !first && i.group_key !== `dm:${active}`) fresh ||= i;
      map.set(i.id, i.count);
    }
    seen.current = map;
    if (fresh) {
      setToast(fresh);
      chime();
      window.dispatchEvent(new Event("student-messages-updated"));
    }
  }, []);
  useEffect(() => {
    load().catch(() => {});
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load().catch(() => {});
    }, 15000);
    const refresh = () => load().catch(() => {});
    window.addEventListener("student-messages-updated", refresh);
    const outside = (e: PointerEvent) => {
      if (menu.current && !menu.current.contains(e.target as Node)) menu.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      clearInterval(timer);
      window.removeEventListener("student-messages-updated", refresh);
      document.removeEventListener("pointerdown", outside);
    };
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);
  async function open(item: Item) {
    if (menu.current) menu.current.open = false;
    setToast(null);
    if (!item.read_at)
      await authFetch("/api/lms-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", ids: [item.id] }),
      }).catch(() => {});
    load().catch(() => {});
    if (item.link) router.push(item.link);
  }
  async function readAll() {
    await authFetch("/api/lms-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all" }),
    }).catch(() => {});
    await load();
  }
  return (
    <>
      <details className="nb" ref={menu}>
        <summary aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} title="Notifications">
          <Bell size={21} />
          {unread > 0 && <span className="msg-badge nb-count">{unread > 99 ? "99+" : unread}</span>}
        </summary>
        <div className="nb-panel" role="menu">
          <header>
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" onClick={readAll}>
                Mark all as read
              </button>
            )}
          </header>
          <div className="nb-list">
            {items.length ? (
              items.map((i) => (
                <button key={i.id} type="button" className={`nb-item ${i.read_at ? "" : "unread"}`} onClick={() => open(i)}>
                  <Avatar item={i} />
                  <span className="nb-text">
                    <strong>{i.title}</strong>
                    {i.body && <small>{describe(i)}</small>}
                    <em>{ago(i.updated_at)}</em>
                  </span>
                  {!i.read_at && <span className="nb-dot" aria-label="Unread" />}
                </button>
              ))
            ) : (
              <p className="nb-empty">You&apos;re all caught up.</p>
            )}
          </div>
        </div>
      </details>
      {toast && (
        <div className="nb-toast" role="status" aria-live="polite">
          <button type="button" className="nb-toast-body" onClick={() => open(toast)}>
            <Avatar item={toast} />
            <span className="nb-text">
              <strong>{toast.title}</strong>
              {toast.body && <small>{describe(toast)}</small>}
            </span>
          </button>
          <button type="button" className="nb-close" aria-label="Dismiss" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
