"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  MessageCircle,
  LockKeyhole,
  Send,
  Plus,
  Users,
  Paperclip,
  AtSign,
  Search,
  Pin,
  ArrowLeft,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import {
  reactions,
  COMMUNITY_FILE_LIMIT,
  mentionPattern,
  type ChatChannel,
  type ChatMessage,
  type ChatFile,
  type Person,
} from "@/lib/lms/community";
type Report = { id: string; message_id: number; reason: string };
type Feed = {
  messages: ChatMessage[];
  has_more: boolean;
  channel: ChatChannel;
  people: Person[];
  pinned: { id: number; body: string; author_name: string }[];
  reports: Report[];
  members: string[];
};
async function api(path: string, body?: unknown) {
  const r = await authFetch(
    "/api/lms-community" + path,
    body
      ? {
          signal: AbortSignal.timeout(30000),
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : { signal: AbortSignal.timeout(30000) },
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Community unavailable.");
  return d;
}
function roomTitle(room: ChatChannel) {
  return room.order_id
    ? room.name.replace(` · ${room.order_id}`, "")
    : room.name;
}
function plain(body: string) {
  return body.replace(mentionPattern(), (_m, name: string) => "@" + name);
}
function Body({ body, userId }: { body: string; userId: string }) {
  const parts: ReactNode[] = [];
  let start = 0;
  function text(value: string, key: string) {
    return value.split(/(https?:\/\/[^\s]+)/g).map((p, i) =>
      /^https?:\/\//.test(p) ? (
        <a
          key={`${key}-${i}`}
          href={p}
          target="_blank"
          rel="noopener noreferrer"
        >
          {p}
        </a>
      ) : (
        p
      ),
    );
  }
  for (const match of Array.from(body.matchAll(mentionPattern()))) {
    parts.push(...text(body.slice(start, match.index), String(start)));
    parts.push(
      <span
        key={match.index}
        className={`chat-mention ${match[2] === userId ? "chat-mention-me" : ""}`}
      >
        @{match[1]}
      </span>,
    );
    start = match.index! + match[0].length;
  }
  parts.push(...text(body.slice(start), "end"));
  return <>{parts}</>;
}
export default function CourseCommunity({ courseId }: { courseId: string }) {
  const [privateCourse, setPrivateCourse] = useState(false);
  const [channels, setChannels] = useState<ChatChannel[]>([]),
    [selected, setSelected] = useState(""),
    [messages, setMessages] = useState<ChatMessage[]>([]),
    [people, setPeople] = useState<Person[]>([]),
    [coursePeople, setCoursePeople] = useState<Person[]>([]),
    [instructor, setInstructor] = useState(false),
    [userId, setUserId] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [text, setText] = useState(""),
    [more, setMore] = useState(false),
    [older, setOlder] = useState(false),
    [search, setSearch] = useState(""),
    [searchInput, setSearchInput] = useState(""),
    [thread, setThread] = useState<number | null>(null),
    [reply, setReply] = useState<ChatMessage | null>(null),
    [edit, setEdit] = useState<ChatMessage | null>(null),
    [files, setFiles] = useState<ChatFile[]>([]),
    [picker, setPicker] = useState(false),
    [personSearch, setPersonSearch] = useState(""),
    [pinned, setPinned] = useState<Feed["pinned"]>([]),
    [reports, setReports] = useState<Report[]>([]),
    [reportTarget, setReportTarget] = useState<number | null>(null),
    [manage, setManage] = useState<"create" | "members" | "settings" | null>(
      null,
    ),
    [memberIds, setMemberIds] = useState<string[]>([]),
    [savedMembers, setSavedMembers] = useState<string[]>([]);
  const editorRef = useRef<HTMLFormElement>(null),
    reportRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const form = manage
      ? editorRef.current
      : reportTarget
        ? reportRef.current
        : null;
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      form
        .querySelector<
          HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=hidden]),textarea")
        ?.focus({ preventScroll: true });
    }
  }, [manage, reportTarget]);
  const draftId = useRef(crypto.randomUUID()),
    historyLoaded = useRef(false),
    scrollBox = useRef<HTMLDivElement>(null),
    draftFiles = useRef<ChatFile[]>([]),
    lastRead = useRef(0),
    firstFeed = useRef(true);
  const active = channels.find((c) => c.id === selected);
  useEffect(() => {
    draftFiles.current = files;
  }, [files]);
  const load = useCallback(async () => {
    const d = await api(`?course=${courseId}`);
    setChannels(d.channels);
    setPrivateCourse(Boolean(d.private_course));
    setInstructor(d.instructor);
    setUserId(d.user_id);
    setCoursePeople(d.people);
    setSelected((id) =>
      d.channels.some((c: ChatChannel) => c.id === id)
        ? id
        : d.channels.find((c: ChatChannel) => !c.archived)?.id ||
          d.channels[0]?.id ||
          "",
    );
  }, [courseId]);
  useEffect(() => {
    let alive = true;
    setSelected("");
    setMessages([]);
    setLoading(true);
    setError("");
    const refresh = () =>
      load()
        .catch((e) => {
          if (alive) setError(e.message);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [load]);
  useEffect(() => {
    setText("");
    setReply(null);
    setEdit(null);
    setFiles([]);
    setSearch("");
    setSearchInput("");
    setThread(null);
    setManage(null);
    setPicker(false);
    setReportTarget(null);
    draftId.current = crypto.randomUUID();
    lastRead.current = 0;
    return () => {
      for (const file of draftFiles.current)
        void api("", {
          action: "discard_file",
          course: courseId,
          channel: selected,
          file_id: file.id,
        }).catch(() => {});
    };
  }, [selected, courseId]);
  const feedUrl = useCallback(
    (before?: number) =>
      `?${new URLSearchParams({ course: courseId, channel: selected, ...(search ? { search } : {}), ...(thread ? { thread: String(thread) } : {}), ...(before ? { before: String(before) } : {}) })}`,
    [courseId, selected, search, thread],
  );
  const applyFeed = useCallback((d: Feed) => {
    const box = scrollBox.current;
    const stayAtBottom =
      !historyLoaded.current &&
      !!box &&
      box.scrollHeight - box.scrollTop - box.clientHeight < 32;
    setMessages(d.messages);
    setMore(d.has_more);
    setPeople(d.people);
    setPinned(d.pinned);
    setReports(d.reports);
    setSavedMembers(d.members);
    setChannels((old) =>
      old.map((c) => (c.id === d.channel.id ? { ...c, ...d.channel } : c)),
    );
    if (firstFeed.current || stayAtBottom) {
      firstFeed.current = false;
      requestAnimationFrame(() => {
        if (scrollBox.current)
          scrollBox.current.scrollTop = scrollBox.current.scrollHeight;
      });
    }
  }, []);
  const refreshMessages = useCallback(async () => {
    const d = (await api(feedUrl())) as Feed;
    historyLoaded.current = false;
    setOlder(false);
    applyFeed(d);
  }, [feedUrl, applyFeed]);
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    setMessages([]);
    firstFeed.current = true;
    historyLoaded.current = false;
    setOlder(false);
    let refreshing = false;
    const refresh = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const d = (await api(feedUrl())) as Feed;
        if (alive) {
          applyFeed(d);
          setError("");
        }
      } catch (e) {
        if (alive) {
          setMessages([]);
          setPeople([]);
          setPinned([]);
          setReports([]);
          setError((e as Error).message);
        }
      } finally {
        refreshing = false;
      }
    };
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden && !historyLoaded.current) void refresh();
    }, 8000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [selected, feedUrl, applyFeed]);
  const markRead = useCallback(() => {
    const box = scrollBox.current;
    if (
      !box ||
      document.hidden ||
      search ||
      thread ||
      older ||
      !messages.length
    )
      return;
    const rect = box.getBoundingClientRect();
    if (
      rect.bottom > window.innerHeight ||
      rect.bottom < 0 ||
      box.scrollHeight - box.scrollTop - box.clientHeight > 32
    )
      return;
    const id = messages.at(-1)!.id;
    if (id <= lastRead.current) return;
    lastRead.current = id;
    void api("", { action: "read", course: courseId, channel: selected, id })
      .then(() => load())
      .catch(() => {
        lastRead.current = 0;
      });
  }, [messages, courseId, selected, search, thread, older, load]);
  useEffect(() => {
    const frame = requestAnimationFrame(markRead);
    window.addEventListener("scroll", markRead, { passive: true });
    document.addEventListener("visibilitychange", markRead);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", markRead);
      document.removeEventListener("visibilitychange", markRead);
    };
  }, [markRead]);
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message || "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function act(action: string, values: Record<string, unknown> = {}) {
    await api("", { action, course: courseId, channel: selected, ...values });
    await refreshMessages();
    await load();
  }
  const canPost =
    active &&
    !active.archived &&
    (instructor || (!active.announcements && !active.locked));
  const mentionQuery = text.match(/@([^@\n\[\]]{0,60})$/);
  const matches = people
    .filter((p) =>
      p.name
        .toLowerCase()
        .includes(
          (picker ? personSearch : mentionQuery?.[1] || "").toLowerCase(),
        ),
    )
    .slice(0, 12);
  function tag(person: Person) {
    const token = `@[${person.name.replace(/[\[\]\r\n]/g, "").slice(0, 120)}](${person.user_id}) `;
    setText((value) =>
      mentionQuery
        ? value.slice(0, value.length - mentionQuery[0].length) + token
        : value + (value && !value.endsWith(" ") ? " " : "") + token,
    );
    setPicker(false);
    setPersonSearch("");
    draftId.current = crypto.randomUUID();
  }
  async function download(file: ChatFile) {
    const r = await authFetch(
      `/api/lms-community?${new URLSearchParams({ course: courseId, channel: selected, file: file.id })}`,
    );
    if (!r.ok) {
      const d = await r.json();
      throw Error(d.error || "File unavailable.");
    }
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (loading)
    return (
      <section className="lms-panel">Loading your course community…</section>
    );
  return (
    <section
      className="lms-community chat-workspace"
      aria-label="Course community"
    >
      <header className="lms-community-heading">
        <div>
          <p className="lms-eyebrow">YOUR LEARNING COMMUNITY</p>
          <h2>
            <MessageCircle size={25} /> Course conversations
          </h2>
          <p>
            {privateCourse
              ? "Your private space for questions, project feedback and session plans with your mentor."
              : "Ask questions, share your work and stay connected with your classmates and instructors."}
          </p>
        </div>
        {instructor && !privateCourse && (
          <button
            className="lms-button"
            onClick={() => {
              setManage("create");
              setMemberIds([]);
            }}
          >
            <Plus size={16} /> Create group
          </button>
        )}
      </header>
      {error && (
        <div className="lms-alert" role="alert">
          {error}{" "}
          <button
            onClick={() =>
              run(async () => {
                await load();
                if (selected) await refreshMessages();
              })
            }
          >
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p className="lms-notice" role="status">
          {notice}
        </p>
      )}
      <div className="lms-community-layout">
        <aside className="lms-community-channels">
          <h3>Conversations</h3>
          <p className="lms-muted">
            Unread messages and @mentions appear here.
          </p>
          {channels.map((c) => (
            <button
              key={c.id}
              disabled={busy}
              onClick={() => setSelected(c.id)}
              aria-pressed={selected === c.id}
              className={selected === c.id ? "selected" : ""}
            >
              {c.private ? <LockKeyhole size={17} /> : <Users size={17} />}
              <span>
                {roomTitle(c)}
                <small>
                  {c.archived
                    ? "Archived"
                    : c.announcements
                      ? "Announcements"
                      : c.private
                        ? "Private group"
                        : "Course group"}
                </small>
              </span>
              {Number(c.mentions) > 0 ? (
                <b className="chat-unread">@{c.mentions}</b>
              ) : Number(c.unread) > 0 ? (
                <b className="chat-unread">{c.unread}</b>
              ) : null}
            </button>
          ))}
          <button className="lms-text" onClick={() => run(load)}>
            Refresh conversations
          </button>
          <p className="lms-muted">
            Respect your classmates. Share payment details privately with the
            training team.
          </p>
        </aside>
        <div className="lms-community-chat">
          {active ? (
            <>
              <header>
                <div>
                  <h3>{roomTitle(active)}</h3>
                  <p>{active.description}</p>
                  <small>
                    {people.length} participants ·{" "}
                    {active.private
                      ? "Private conversation"
                      : "Enrolled students & instructors"}
                  </small>
                </div>
                {instructor && (
                  <div className="chat-tools">
                    <button
                      className="lms-text"
                      onClick={() => setManage("settings")}
                    >
                      Room settings
                    </button>
                    {active.private && !active.order_id && (
                      <button
                        className="lms-text"
                        onClick={() => {
                          setMemberIds(savedMembers);
                          setManage("members");
                        }}
                      >
                        Manage members
                      </button>
                    )}
                  </div>
                )}
              </header>
              <form
                className="chat-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(searchInput.trim());
                }}
              >
                <Search size={17} />
                <input
                  aria-label="Search this conversation"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search this conversation…"
                  maxLength={120}
                />
                <button className="lms-text">Search</button>
                {search && (
                  <button
                    type="button"
                    className="lms-text"
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>
              {thread && (
                <div className="chat-thread-bar">
                  <button className="lms-text" onClick={() => setThread(null)}>
                    <ArrowLeft size={16} /> All messages
                  </button>
                  <strong>Reply thread</strong>
                </div>
              )}
              {!!pinned.length && (
                <details className="chat-pins">
                  <summary>
                    <Pin size={15} /> Pinned messages ({pinned.length})
                  </summary>
                  {pinned.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSearch("");
                        setSearchInput("");
                        setThread(p.id);
                      }}
                    >
                      <strong>{p.author_name}</strong>{" "}
                      {plain(p.body).slice(0, 160)}
                    </button>
                  ))}
                </details>
              )}
              {instructor && !!reports.length && (
                <details className="chat-reports">
                  <summary>Reports to review ({reports.length})</summary>
                  {reports.map((r) => (
                    <div key={r.id}>
                      <p>{r.reason}</p>
                      <button
                        className="lms-text"
                        onClick={() => setThread(r.message_id)}
                      >
                        View message
                      </button>
                      <button
                        className="lms-text"
                        disabled={busy}
                        onClick={() =>
                          run(() => act("resolve", { report_id: r.id }))
                        }
                      >
                        Mark reviewed
                      </button>
                    </div>
                  ))}
                </details>
              )}
              <div
                ref={scrollBox}
                onScroll={markRead}
                className="lms-message-list"
                aria-label="Messages"
              >
                {older && (
                  <div className="lms-notice">
                    Live updates are paused while you browse older messages.{" "}
                    <button
                      onClick={() =>
                        run(async () => {
                          firstFeed.current = true;
                          await refreshMessages();
                        })
                      }
                    >
                      Back to latest
                    </button>
                  </div>
                )}
                {more && (
                  <button
                    className="lms-text"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const d = (await api(feedUrl(messages[0]?.id))) as Feed;
                        historyLoaded.current = true;
                        setOlder(true);
                        setMessages((old) => [...d.messages, ...old]);
                        setMore(d.has_more);
                      })
                    }
                  >
                    Load earlier messages
                  </button>
                )}
                {!messages.length && !error && (
                  <div className="lms-empty">
                    <MessageCircle size={32} />
                    <h3>
                      {search
                        ? "No matching messages"
                        : "Start the conversation"}
                    </h3>
                    <p>
                      {search
                        ? "Try a different word or clear your search."
                        : "Introduce yourself, ask a question or share what you’re building."}
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <article
                    id={`chat-message-${m.id}`}
                    key={m.id}
                    className={`lms-message ${m.user_id === userId ? "own" : ""} ${m.body.includes(`](${userId})`) ? "chat-tagged" : ""}`}
                  >
                    <div>
                      <span className="chat-avatar" aria-hidden="true">
                        {m.author_name.slice(0, 1).toUpperCase()}
                      </span>
                      <strong>{m.author_name}</strong>
                      {m.instructor && (
                        <span className="lms-pill">Instructor</span>
                      )}
                      <time dateTime={m.created_at}>
                        {new Date(m.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      {m.edited_at && <small>Edited</small>}
                      {m.pinned && <Pin size={14} aria-label="Pinned" />}
                    </div>
                    {m.reply && (
                      <button
                        className="chat-quote"
                        onClick={() => setThread(m.reply!.id)}
                      >
                        <strong>{m.reply.author_name}</strong>
                        <span>{plain(m.reply.body).slice(0, 180)}</span>
                      </button>
                    )}
                    <p>
                      <Body body={m.body} userId={userId} />
                    </p>
                    {!!m.files.length && (
                      <div className="chat-files">
                        {m.files.map((f) => (
                          <button
                            key={f.id}
                            className="chat-file"
                            disabled={busy}
                            onClick={() => run(() => download(f))}
                          >
                            <Paperclip size={15} />
                            {f.name}
                            <small>{Math.ceil(f.size / 1024)} KB</small>
                          </button>
                        ))}
                      </div>
                    )}
                    {!m.deleted && (
                      <>
                        <div
                          className="chat-reactions"
                          aria-label={`Reactions to ${m.author_name}'s message`}
                        >
                          {Object.entries(reactions).map(([key, emoji]) => {
                            const r = m.reactions.find((r) => r.emoji === key);
                            return (
                              <button
                                key={key}
                                disabled={busy}
                                aria-label={`${key} reaction`}
                                aria-pressed={!!r?.mine}
                                onClick={() =>
                                  run(() =>
                                    act("react", {
                                      id: m.id,
                                      emoji: key,
                                      active: !r?.mine,
                                    }),
                                  )
                                }
                              >
                                {emoji}
                                {r?.count ? ` ${r.count}` : ""}
                              </button>
                            );
                          })}
                        </div>
                        <div className="chat-message-actions">
                          {canPost && (
                            <button
                              onClick={() => {
                                setReply(m);
                                setEdit(null);
                                document
                                  .getElementById(`message-${courseId}`)
                                  ?.focus();
                              }}
                            >
                              Reply
                            </button>
                          )}
                          <button onClick={() => setThread(m.reply_to || m.id)}>
                            Open thread
                          </button>
                          {m.user_id === userId && canPost && (
                            <button
                              onClick={() => {
                                setEdit(m);
                                setText(m.body);
                                setReply(null);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {instructor && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                run(() =>
                                  act("pin", { id: m.id, pinned: !m.pinned }),
                                )
                              }
                            >
                              {m.pinned ? "Unpin" : "Pin"}
                            </button>
                          )}
                          {(instructor || m.user_id === userId) && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                run(() => act("delete", { id: m.id }))
                              }
                            >
                              Remove
                            </button>
                          )}
                          {!instructor && m.user_id !== userId && (
                            <button onClick={() => setReportTarget(m.id)}>
                              Report
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
              {canPost ? (
                <form
                  className="lms-message-compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!text.trim()) return;
                    void run(async () => {
                      await api(
                        "",
                        edit
                          ? {
                              action: "edit",
                              course: courseId,
                              channel: selected,
                              id: edit.id,
                              body: text.trim(),
                            }
                          : {
                              action: "send",
                              course: courseId,
                              channel: selected,
                              body: text.trim(),
                              client_id: draftId.current,
                              reply_to: reply?.id || thread,
                              files: files.map((f) => f.id),
                            },
                      );
                      setText("");
                      if (!edit) {
                        setFiles([]);
                        draftFiles.current = [];
                      }
                      setReply(null);
                      setEdit(null);
                      draftId.current = crypto.randomUUID();
                      firstFeed.current = true;
                      await refreshMessages();
                      await load();
                      setNotice(edit ? "Message updated." : "Message sent.");
                    });
                  }}
                >
                  {(reply || edit) && (
                    <div className="chat-composing-context">
                      <span>
                        {edit
                          ? "Editing your message"
                          : `Replying to ${reply?.author_name}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReply(null);
                          if (edit) setText("");
                          setEdit(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <label htmlFor={`message-${courseId}`}>
                    {edit ? "Edit message" : `Message ${roomTitle(active)}`}
                  </label>
                  <textarea
                    id={`message-${courseId}`}
                    maxLength={2000}
                    required
                    value={text}
                    disabled={busy}
                    onChange={(e) => {
                      setText(e.target.value);
                      draftId.current = crypto.randomUUID();
                    }}
                    placeholder="Write a message… type @ to tag a student or instructor"
                  />
                  {(picker || mentionQuery) && (
                    <div
                      className="chat-mention-picker"
                      aria-label="Tag a participant"
                    >
                      {picker && (
                        <input
                          aria-label="Find a person to tag"
                          value={personSearch}
                          onChange={(e) => setPersonSearch(e.target.value)}
                          placeholder="Find a participant…"
                        />
                      )}
                      {matches.map((p) => (
                        <button
                          type="button"
                          key={p.user_id}
                          onClick={() => tag(p)}
                        >
                          {p.name}
                          {p.instructor && <small>Instructor</small>}
                        </button>
                      ))}
                      {!matches.length && (
                        <p>No matching participants in this conversation.</p>
                      )}
                    </div>
                  )}
                  {!!files.length && (
                    <div className="chat-files">
                      {files.map((f) => (
                        <div className="chat-file" key={f.id}>
                          <Paperclip size={15} />
                          {f.name}
                          <button
                            type="button"
                            disabled={busy}
                            aria-label={`Remove ${f.name}`}
                            onClick={() =>
                              run(async () => {
                                await api("", {
                                  action: "discard_file",
                                  course: courseId,
                                  channel: selected,
                                  file_id: f.id,
                                });
                                setFiles((old) =>
                                  old.filter((x) => x.id !== f.id),
                                );
                              })
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="chat-compose-tools">
                    <div>
                      <button
                        type="button"
                        className="lms-text"
                        aria-label="Tag a student or instructor"
                        onClick={() => setPicker(!picker)}
                      >
                        <AtSign size={18} /> Tag someone
                      </button>
                      {!edit && (
                        <label className="chat-upload">
                          <Paperclip size={18} /> Add file
                          <input
                            aria-label="Attach file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
                            disabled={busy || files.length >= 3}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              if (!file) return;
                              void run(async () => {
                                if (file.size > COMMUNITY_FILE_LIMIT)
                                  throw Error(
                                    "Choose a file smaller than 4 MB.",
                                  );
                                const r = await authFetch(
                                  `/api/lms-community?${new URLSearchParams({ action: "upload", course: courseId, channel: selected, name: file.name })}`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type":
                                        file.type || "application/octet-stream",
                                    },
                                    body: file,
                                  },
                                );
                                const d = await r.json();
                                if (!r.ok) throw Error(d.error);
                                setFiles((old) => [...old, d.file]);
                              });
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <button
                      className="lms-button"
                      disabled={busy || !text.trim()}
                    >
                      <Send size={16} />
                      {busy
                        ? "Please wait…"
                        : edit
                          ? "Save edit"
                          : "Send message"}
                    </button>
                  </div>
                  <small>
                    Up to 2,000 characters including tags · 3 files, 4 MB each ·
                    Photos, PDF or text
                  </small>
                </form>
              ) : (
                <p className="lms-notice">
                  {active.archived
                    ? "This conversation is archived. You can still read its history."
                    : active.announcements
                      ? "Only instructors can post announcements here. Ask questions in the course lounge."
                      : "The instructor has paused new messages in this conversation."}
                </p>
              )}
            </>
          ) : (
            <div className="lms-empty">
              {privateCourse
                ? "A private mentor conversation will appear for each student when their payment or course access is approved."
                : "No conversations available yet."}
            </div>
          )}
        </div>
      </div>
      {reportTarget && (
        <form
          ref={reportRef}
          className="lms-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(async () => {
              await act("report", {
                id: reportTarget,
                reason: f.get("reason"),
              });
              setReportTarget(null);
              setNotice("Your report was sent privately to the instructors.");
            });
          }}
        >
          <h3>Report this message</h3>
          <label>
            Reason
            <textarea name="reason" required minLength={5} maxLength={500} />
          </label>
          <button className="lms-button" disabled={busy}>
            Send report
          </button>
          <button
            type="button"
            className="lms-text"
            onClick={() => setReportTarget(null)}
          >
            Cancel
          </button>
        </form>
      )}
      {manage && instructor && (
        <form
          ref={editorRef}
          key={manage + selected}
          className="lms-panel lms-group-editor"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(async () => {
              if (manage === "create") {
                const d = await api("", {
                  action: "create",
                  course: courseId,
                  name: f.get("name"),
                  description: f.get("description"),
                  private: f.get("private") === "on",
                  announcements: f.get("announcements") === "on",
                  members: memberIds,
                });
                await load();
                setSelected(d.id);
              } else if (manage === "members")
                await act("members", { members: memberIds });
              else
                await act("settings", {
                  name: f.get("name"),
                  description: f.get("description"),
                  announcements: f.get("announcements") === "on",
                  locked: f.get("locked") === "on",
                  archived: f.get("archived") === "on",
                });
              setManage(null);
              setNotice("Conversation saved.");
            });
          }}
        >
          <h3>
            {manage === "create"
              ? "Create a course group"
              : manage === "members"
                ? `Members of ${active?.name}`
                : "Conversation settings"}
          </h3>
          <fieldset disabled={busy}>
            {manage !== "members" && (
              <>
                <label>
                  Group name
                  {manage === "settings" && active?.order_id ? (
                    <>
                      <input name="name" type="hidden" value={active.name} />
                      <input value={roomTitle(active)} readOnly />
                    </>
                  ) : (
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={80}
                      defaultValue={manage === "settings" ? active?.name : ""}
                    />
                  )}
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    maxLength={500}
                    defaultValue={
                      manage === "settings" ? active?.description : ""
                    }
                  />
                </label>
                <label className="lms-check">
                  <input
                    type="checkbox"
                    name="announcements"
                    defaultChecked={
                      manage === "settings" && active?.announcements
                    }
                  />
                  Only instructors can post announcements
                </label>
              </>
            )}
            {manage === "create" && (
              <label className="lms-check">
                <input type="checkbox" name="private" defaultChecked />
                Private group: selected students and instructors only
              </label>
            )}
            {manage === "settings" ? (
              <>
                <label className="lms-check">
                  <input
                    type="checkbox"
                    name="locked"
                    defaultChecked={active?.locked}
                  />
                  Pause student messages
                </label>
                <label className="lms-check">
                  <input
                    type="checkbox"
                    name="archived"
                    defaultChecked={active?.archived}
                  />
                  Archive this conversation (keep history)
                </label>
                <p>
                  Privacy is fixed when a group is created, so private
                  conversations cannot accidentally become public.
                </p>
              </>
            ) : (
              <>
                <p>
                  Choose students for this private group. Instructors always
                  have access.
                </p>
                {coursePeople
                  .filter((p) => !p.instructor)
                  .map((p) => (
                    <label key={p.user_id} className="lms-check">
                      <input
                        type="checkbox"
                        checked={memberIds.includes(p.user_id)}
                        onChange={(e) =>
                          setMemberIds((old) =>
                            e.target.checked
                              ? [...old, p.user_id]
                              : old.filter((id) => id !== p.user_id),
                          )
                        }
                      />
                      {p.name}
                    </label>
                  ))}
                {!coursePeople.some((p) => !p.instructor) && (
                  <p>No enrolled students yet.</p>
                )}
              </>
            )}
            <button className="lms-button">Save conversation</button>
            <button
              type="button"
              className="lms-text"
              onClick={() => setManage(null)}
            >
              Cancel
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
