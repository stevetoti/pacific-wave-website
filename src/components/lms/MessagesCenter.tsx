"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Flag,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldOff,
  UserPlus,
  Users,
  X,
  Trash2,
  Settings as SettingsIcon,
  Inbox,
  CheckCheck,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
type Person = { user_id: string; full_name: string; headline: string; city: string; avatar_url: string };
type ThreadSummary = { id: string; person: Person; last_message_at: string; preview: string; last_mine: boolean; last_seen: boolean; unread: number };
type Overview = {
  me: string;
  settings: { directory_visible: boolean; message_emails: boolean };
  can_browse: boolean;
  threads: ThreadSummary[];
  requests: { id: string; note: string; created_at: string; person: Person }[];
  sent: { id: string; created_at: string; person: Person }[];
  contacts: { role: "instructor" | "student"; person: Person }[];
  blocked: Person[];
};
type FileMeta = { id: string; name: string; mime: string; size: number };
type Message = { id: number; sender: string; body: string; deleted: boolean; created_at: string; mine: boolean; file: FileMeta | null; client_id?: string; pending?: boolean; seen?: boolean };
type ThreadDetail = { id: string; person: Person; can_message: boolean; blocked_by_me: boolean };
type DirectoryPerson = Person & { courses: string[]; connection: "none" | "sent" | "received" | "connected"; bio: string };
async function api(path = "", body?: unknown) {
  const r = await authFetch(
    "/api/lms-messages" + path,
    body
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {},
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Something went wrong. Please try again.");
  return d;
}
function Avatar({ person, size = 44 }: { person?: Person; size?: number }) {
  const initial = (person?.full_name || "?").slice(0, 1).toUpperCase();
  return (
    <span className="msg-avatar" style={{ width: size, height: size, fontSize: size / 2.4 }}>
      {person?.avatar_url ? (
        <Image src={person.avatar_url} alt="" width={size} height={size} unoptimized />
      ) : (
        initial
      )}
    </span>
  );
}
const time = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
};
// Attachments need the session token, so they are fetched and shown as blob URLs.
function Attachment({ file }: { file: FileMeta }) {
  const [url, setUrl] = useState("");
  const image = file.mime.startsWith("image/");
  useEffect(() => {
    if (!image) return;
    let revoked = "";
    authFetch(`/api/lms-messages?file=${file.id}`)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (b) setUrl((revoked = URL.createObjectURL(b)));
      })
      .catch(() => {});
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [file.id, image]);
  async function download() {
    const r = await authFetch(`/api/lms-messages?file=${file.id}`);
    if (!r.ok) return;
    const u = URL.createObjectURL(await r.blob());
    const a = document.createElement("a");
    a.href = u;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  if (image && url)
    return <img className="msg-image" src={url} alt={file.name} onClick={download} />;
  return (
    <button type="button" className="msg-file" onClick={download}>
      <Paperclip size={15} /> {file.name} <small>{Math.ceil(file.size / 1024)} KB</small>
    </button>
  );
}
export default function MessagesCenter() {
  const [view, setView] = useState<"chats" | "requests" | "people" | "settings">("chats");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [more, setMore] = useState(false);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<FileMeta | null>(null);
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [dirMore, setDirMore] = useState(false);
  const [query, setQuery] = useState("");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const feed = useRef<HTMLDivElement>(null);
  const loadOverview = useCallback(async () => setOverview(await api()), []);
  const loadThread = useCallback(async (id: string, keepScroll = false) => {
    const d = await api(`?thread=${id}`);
    setDetail(d.thread);
    setMore(d.more);
    setMessages((prev) => {
      const pending = prev.filter((m) => m.pending);
      return [...d.messages, ...pending.filter((p) => !d.messages.some((m: Message) => m.client_id === p.client_id))];
    });
    const last = d.messages.at(-1);
    if (last) await api("", { action: "read", thread_id: id, last_id: last.id });
    window.dispatchEvent(new Event("student-messages-updated"));
    if (!keepScroll) requestAnimationFrame(() => feed.current?.scrollTo({ top: feed.current.scrollHeight }));
  }, []);
  async function run(work: () => Promise<void>, done = "") {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      if (done) setNotice(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  // Deep links: ?tab=messages&with=<user> opens (or starts) a conversation.
  useEffect(() => {
    loadOverview()
      .then(async () => {
        const params = new URLSearchParams(window.location.search);
        const withUser = params.get("with");
        const thread = params.get("thread");
        if (params.get("view") === "requests") setView("requests");
        if (thread) setActive(thread);
        else if (withUser) {
          const d = await api("", { action: "open", user_id: withUser });
          setActive(d.thread_id);
        }
      })
      .catch((e) => setError(e.message));
  }, [loadOverview]);
  // Lets the notification bell skip pop-ups for the conversation already on screen.
  useEffect(() => {
    if (active) document.body.dataset.activeThread = active;
    else delete document.body.dataset.activeThread;
    return () => {
      delete document.body.dataset.activeThread;
    };
  }, [active]);
  useEffect(() => {
    if (!active) return;
    setMessages([]);
    setDetail(null);
    loadThread(active).catch((e) => setError(e.message));
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadThread(active, true).catch(() => {});
    }, 8000);
    return () => clearInterval(timer);
  }, [active, loadThread]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadOverview().catch(() => {});
    }, 20000);
    return () => clearInterval(timer);
  }, [loadOverview]);
  const searchPeople = useCallback(async (q: string, offset = 0) => {
    const d = await api(`?directory=1&q=${encodeURIComponent(q)}&offset=${offset}`);
    setDirectory((prev) => (offset ? [...prev, ...d.people] : d.people));
    setDirMore(d.more);
  }, []);
  useEffect(() => {
    if (view !== "people") return;
    const t = setTimeout(() => searchPeople(query).catch((e) => setError(e.message)), 300);
    return () => clearTimeout(t);
  }, [view, query, searchPeople]);
  async function openWith(userId: string) {
    await run(async () => {
      const d = await api("", { action: "open", user_id: userId });
      setView("chats");
      setActive(d.thread_id);
    });
  }
  async function send() {
    if (!active || (!draft.trim() && !file)) return;
    const client_id = crypto.randomUUID();
    const body = draft.trim();
    const optimistic: Message = { id: Number.MAX_SAFE_INTEGER, sender: overview?.me || "", body, deleted: false, created_at: new Date().toISOString(), mine: true, file, client_id, pending: true };
    setMessages((m) => [...m, optimistic]);
    setDraft("");
    const attached = file;
    setFile(null);
    requestAnimationFrame(() => feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }));
    try {
      await api("", { action: "send", thread_id: active, body, file_id: attached?.id || null, client_id });
      await loadThread(active, true);
      requestAnimationFrame(() => feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }));
      loadOverview().catch(() => {});
    } catch (e) {
      setMessages((m) => m.filter((x) => x.client_id !== client_id));
      setDraft(body);
      setFile(attached);
      setError(e instanceof Error ? e.message : "Message not sent.");
    }
  }
  async function upload(f: File) {
    if (!active) return;
    await run(async () => {
      if (f.size > 4 * 1024 * 1024) throw Error("Choose a file smaller than 4 MB.");
      const r = await authFetch(`/api/lms-messages?action=upload&thread=${active}&name=${encodeURIComponent(f.name)}`, {
        method: "POST",
        headers: { "Content-Type": f.type || "application/octet-stream" },
        body: f,
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Upload failed.");
      setFile(d);
    });
  }
  const connectButton = (p: DirectoryPerson) => {
    if (p.connection === "connected")
      return (
        <button type="button" className="lms-button" onClick={() => openWith(p.user_id)}>
          <MessageCircle size={16} /> Message
        </button>
      );
    if (p.connection === "sent") return <span className="msg-pill">Request sent</span>;
    if (p.connection === "received")
      return (
        <button type="button" className="lms-button" onClick={() => setView("requests")}>
          Respond to request
        </button>
      );
    return (
      <button type="button" className="lms-button msg-connect" onClick={() => { setNoteFor(p.user_id); setNote(""); }}>
        <UserPlus size={16} /> Connect
      </button>
    );
  };
  if (!overview)
    return (
      <section className="sd-panel">{error ? <div className="lms-alert" role="alert">{error}</div> : "Loading your messages…"}</section>
    );
  const unread = overview.threads.reduce((n, t) => n + t.unread, 0);
  // "Seen" appears once, under my most recent message the other person has read.
  const lastSeenMine = messages.reduce((id, x) => (x.mine && x.seen ? x.id : id), 0);
  const staffContacts = overview.contacts.filter((c) => !overview.threads.some((t) => t.person?.user_id === c.person?.user_id));
  return (
    <section className="sd-panel msg-shell">
      <nav className="msg-tabs" aria-label="Messages sections">
        {([
          ["chats", "Chats", MessageCircle, unread],
          ["requests", "Requests", Inbox, overview.requests.length],
          ...(overview.can_browse ? [["people", "Find people", Users, 0]] : []),
          ["settings", "Settings", SettingsIcon, 0],
        ] as [typeof view, string, typeof Users, number][]).map(([key, label, Icon, count]) => (
          <button key={key} type="button" className={view === key ? "selected" : ""} onClick={() => { setView(key); setError(""); setNotice(""); }}>
            <Icon size={17} /> {label}
            {count > 0 && <span className="msg-badge">{count}</span>}
          </button>
        ))}
      </nav>
      {error && <div className="lms-alert" role="alert">{error}</div>}
      {notice && <div className="lms-notice" role="status">{notice}</div>}
      {view === "chats" && (
        <div className={`msg-chat ${active ? "has-active" : ""}`}>
          <aside className="msg-list" aria-label="Conversations">
            {overview.threads.map((t) => (
              <button key={t.id} type="button" className={`msg-item ${active === t.id ? "selected" : ""}`} onClick={() => setActive(t.id)}>
                <Avatar person={t.person} />
                <span className="msg-item-body">
                  <strong>{t.person?.full_name}</strong>
                  <small>
                    {t.last_mine &&
                      (t.last_seen ? (
                        <CheckCheck size={14} className="msg-tick seen" aria-label="Read" />
                      ) : (
                        <Check size={14} className="msg-tick" aria-label="Sent" />
                      ))}
                    <span className="msg-preview-text">
                      {t.last_mine ? "You: " : ""}
                      {t.preview}
                    </span>
                  </small>
                </span>
                <span className="msg-item-meta">
                  <small>{t.last_message_at && time(t.last_message_at)}</small>
                  {t.unread > 0 && <span className="msg-badge">{t.unread}</span>}
                </span>
              </button>
            ))}
            {staffContacts.length > 0 && (
              <>
                <p className="msg-list-title">{overview.contacts[0]?.role === "instructor" ? "Your instructors" : "Your students"}</p>
                {staffContacts.slice(0, 50).map((c) => (
                  <button key={c.person.user_id} type="button" className="msg-item" onClick={() => openWith(c.person.user_id)}>
                    <Avatar person={c.person} />
                    <span className="msg-item-body">
                      <strong>{c.person.full_name}</strong>
                      <small>{c.role === "instructor" ? "Instructor · message directly" : c.person.headline || "Student"}</small>
                    </span>
                  </button>
                ))}
              </>
            )}
            {!overview.threads.length && !staffContacts.length && (
              <div className="msg-empty">
                <MessageCircle size={28} />
                <p>No conversations yet.</p>
                {overview.can_browse && (
                  <button type="button" className="lms-button" onClick={() => setView("people")}>
                    Find classmates
                  </button>
                )}
              </div>
            )}
          </aside>
          <div className="msg-pane">
            {!active ? (
              <div className="msg-empty msg-pane-empty">
                <MessageCircle size={36} />
                <h3>Your messages</h3>
                <p>Choose a conversation, or connect with classmates in Find people.</p>
              </div>
            ) : (
              <>
                <header className="msg-pane-head">
                  <button type="button" className="msg-back" aria-label="Back to conversations" onClick={() => setActive(null)}>
                    <ArrowLeft size={20} />
                  </button>
                  <Avatar person={detail?.person} size={40} />
                  <span className="msg-item-body">
                    <strong>{detail?.person.full_name || "…"}</strong>
                    <small>{detail?.person.headline || detail?.person.city}</small>
                  </span>
                  {detail && (
                    <details className="msg-menu">
                      <summary aria-label="Conversation options">•••</summary>
                      <div>
                        <button type="button" onClick={() => {
                          const reason = prompt("What's wrong with this conversation? Our team will review it.");
                          if (reason && reason.trim().length >= 3)
                            run(() => api("", { action: "report", thread_id: detail.id, reason: reason.trim() }), "Thanks. Our team will review this conversation.");
                        }}>
                          <Flag size={15} /> Report conversation
                        </button>
                        <button type="button" onClick={() => {
                          if (confirm(`Remove your connection with ${detail.person.full_name}?`))
                            run(async () => { await api("", { action: "remove_connection", user_id: detail.person.user_id }); await loadThread(detail.id, true); }, "Connection removed.");
                        }}>
                          <X size={15} /> Remove connection
                        </button>
                        <button type="button" onClick={() => {
                          if (detail.blocked_by_me || confirm(`Block ${detail.person.full_name}? They won't be able to message or find you.`))
                            run(async () => {
                              await api("", { action: detail.blocked_by_me ? "unblock" : "block", user_id: detail.person.user_id });
                              await Promise.all([loadThread(detail.id, true), loadOverview()]);
                            }, detail.blocked_by_me ? "Unblocked." : "Blocked.");
                        }}>
                          <ShieldOff size={15} /> {detail.blocked_by_me ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </details>
                  )}
                </header>
                <div className="msg-feed" ref={feed}>
                  {more && (
                    <button type="button" className="lms-text msg-older" onClick={() => run(async () => {
                      const d = await api(`?thread=${active}&before=${messages[0]?.id}`);
                      setMessages((m) => [...d.messages, ...m]);
                      setMore(d.more);
                    })}>
                      Load earlier messages
                    </button>
                  )}
                  {messages.map((m, i) => {
                    const day = new Date(m.created_at).toDateString();
                    const showDay = i === 0 || new Date(messages[i - 1].created_at).toDateString() !== day;
                    return (
                      <div key={m.client_id || m.id}>
                        {showDay && <p className="msg-day">{new Date(m.created_at).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}</p>}
                        <div className={`msg-bubble-row ${m.mine ? "mine" : ""}`}>
                          <div className={`msg-bubble ${m.pending ? "pending" : ""}`}>
                            {m.deleted ? (
                              <em>Message removed</em>
                            ) : (
                              <>
                                {m.file && <Attachment file={m.file} />}
                                {m.body && <p>{m.body}</p>}
                              </>
                            )}
                            <small>
                              <span>{m.pending ? "Sending…" : time(m.created_at)}</span>
                              {m.mine && !m.pending && !m.deleted &&
                                (m.seen ? (
                                  <CheckCheck size={17} className="msg-tick seen" aria-label="Read" />
                                ) : (
                                  <Check size={17} className="msg-tick" aria-label="Sent" />
                                ))}
                              {m.mine && !m.deleted && !m.pending && (
                                <button type="button" aria-label="Delete message" onClick={() => {
                                  if (confirm("Delete this message?"))
                                    run(async () => { await api("", { action: "delete", message_id: m.id }); await loadThread(active, true); });
                                }}>
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </small>
                          </div>
                        </div>
                        {m.mine && m.id === lastSeenMine && (
                          <p className="msg-seen">
                            <CheckCheck size={15} /> Seen{detail ? ` by ${detail.person.full_name.split(" ")[0]}` : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {detail && !messages.length && <p className="msg-day">Say hello to {detail.person.full_name.split(" ")[0]}.</p>}
                </div>
                {detail && !detail.can_message ? (
                  <p className="msg-closed">
                    {detail.blocked_by_me ? "You blocked this person. Unblock them to send messages." : "You can't send messages in this conversation right now."}
                  </p>
                ) : (
                  <form className="msg-compose" onSubmit={(e) => { e.preventDefault(); send(); }}>
                    {file && (
                      <span className="msg-attached">
                        <Paperclip size={14} /> {file.name}
                        <button type="button" aria-label="Remove attachment" onClick={() => setFile(null)}><X size={14} /></button>
                      </span>
                    )}
                    <div className="msg-compose-row">
                      <label className="msg-attach" aria-label="Attach a file">
                        <Paperclip size={19} />
                        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,text/plain" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
                      </label>
                      <textarea
                        value={draft}
                        maxLength={2000}
                        rows={1}
                        placeholder="Write a message…"
                        aria-label="Message"
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      />
                      <button className="msg-send" aria-label="Send" disabled={!draft.trim() && !file}>
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {view === "requests" && (
        <div className="msg-section">
          <h3>Invitations</h3>
          {overview.requests.length ? (
            overview.requests.map((r) => (
              <article key={r.id} className="msg-request">
                <Avatar person={r.person} size={52} />
                <div className="msg-item-body">
                  <strong>{r.person.full_name}</strong>
                  <small>{[r.person.headline, r.person.city].filter(Boolean).join(" · ")}</small>
                  {r.note && <p className="msg-note">“{r.note}”</p>}
                </div>
                <div className="msg-actions">
                  <button type="button" className="lms-text" disabled={busy} onClick={() => run(async () => { await api("", { action: "respond", id: r.id, accept: false }); await loadOverview(); window.dispatchEvent(new Event("student-messages-updated")); }, "Request ignored.")}>
                    Ignore
                  </button>
                  <button type="button" className="lms-button" disabled={busy} onClick={() => run(async () => {
                    await api("", { action: "respond", id: r.id, accept: true });
                    await loadOverview();
                    window.dispatchEvent(new Event("student-messages-updated"));
                  }, `You're now connected with ${r.person.full_name}. You can message them from Chats or Find people.`)}>
                    <Check size={16} /> Accept
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="msg-muted">No pending invitations.</p>
          )}
          {overview.sent.length > 0 && (
            <>
              <h3>Sent</h3>
              {overview.sent.map((r) => (
                <article key={r.id} className="msg-request">
                  <Avatar person={r.person} size={40} />
                  <div className="msg-item-body">
                    <strong>{r.person.full_name}</strong>
                    <small>Sent {time(r.created_at)} · waiting for a reply</small>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      )}
      {view === "people" && (
        <div className="msg-section">
          <label className="msg-search">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, course, city or work" aria-label="Search people" />
          </label>
          <div className="msg-people">
            {directory.map((p) => (
              <article key={p.user_id} className="msg-person">
                <Avatar person={p} size={72} />
                <strong>{p.full_name}</strong>
                <small>{p.headline || "Student"}</small>
                {p.city && <small className="msg-muted">{p.city}</small>}
                <div className="msg-course-tags">
                  {p.courses.slice(0, 2).map((c) => <span key={c}>{c}</span>)}
                </div>
                {noteFor === p.user_id ? (
                  <form className="msg-note-form" onSubmit={(e) => {
                    e.preventDefault();
                    run(async () => {
                      const d = await api("", { action: "request", user_id: p.user_id, note });
                      setNoteFor(null);
                      setDirectory((list) => list.map((x) => (x.user_id === p.user_id ? { ...x, connection: d.state === "connected" ? "connected" : "sent" } : x)));
                      loadOverview().catch(() => {});
                    }, "Request sent.");
                  }}>
                    <textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder={`Add a note (optional): e.g. "Hi ${p.full_name.split(" ")[0]}, we're in the same course…"`} />
                    <div>
                      <button type="button" className="lms-text" onClick={() => setNoteFor(null)}>Cancel</button>
                      <button className="lms-button" disabled={busy}>Send request</button>
                    </div>
                  </form>
                ) : (
                  connectButton(p)
                )}
              </article>
            ))}
          </div>
          {!directory.length && <p className="msg-muted">No students match your search.</p>}
          {dirMore && (
            <button type="button" className="lms-text" onClick={() => searchPeople(query, directory.length).catch((e) => setError(e.message))}>
              Show more people
            </button>
          )}
        </div>
      )}
      {view === "settings" && (
        <form className="msg-section" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(async () => {
            await api("", { action: "settings", directory_visible: f.get("directory") === "on", message_emails: f.get("emails") === "on" });
            await loadOverview();
          }, "Settings saved.");
        }}>
          <h3>Privacy & notifications</h3>
          <label className="af-check">
            <input type="checkbox" name="directory" defaultChecked={overview.settings.directory_visible} />
            <span>
              <strong>Show me in the student directory</strong>
              <small className="af-muted">Classmates can find you and send connection requests. Your email and phone number are never shown.</small>
            </span>
          </label>
          <label className="af-check">
            <input type="checkbox" name="emails" defaultChecked={overview.settings.message_emails} />
            <span>
              <strong>Email me about new messages, mentions, announcements and connection requests</strong>
              <small className="af-muted">Quick bursts of messages arrive as one email, and we don&apos;t email you while you&apos;re reading the chat.</small>
            </span>
          </label>
          <button className="lms-button" disabled={busy}>Save settings</button>
          {overview.blocked.length > 0 && (
            <>
              <h3>Blocked people</h3>
              {overview.blocked.map((p) => (
                <article key={p.user_id} className="msg-request">
                  <Avatar person={p} size={40} />
                  <div className="msg-item-body"><strong>{p.full_name}</strong></div>
                  <button type="button" className="lms-text" disabled={busy} onClick={() => run(async () => { await api("", { action: "unblock", user_id: p.user_id }); await loadOverview(); }, `${p.full_name} unblocked.`)}>
                    Unblock
                  </button>
                </article>
              ))}
            </>
          )}
          <p className="msg-muted">
            Direct messages are private between you and the other person. Our team only reviews a conversation if someone reports it.
          </p>
        </form>
      )}
    </section>
  );
}
