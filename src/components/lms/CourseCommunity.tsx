"use client";
import { CourseText } from '@/components/lms/CourseLanguage';
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
  ImagePlus,
  Video,
  Music,
  Megaphone,
  X,
  Youtube,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { supabase } from "@/lib/supabase";
import { MediaView, VoiceRecorder, YouTubeEmbed } from "./CommunityMedia";
import {
  reactions,
  COMMUNITY_FILE_LIMIT,
  MEDIA_TYPES,
  fileKind,
  youtubeId,
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
      ><CourseText text={"@"} />{match[1]}
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
    [savedMembers, setSavedMembers] = useState<string[]>([]),
    [showPeople, setShowPeople] = useState(false),
    [headline, setHeadline] = useState(""),
    [uploading, setUploading] = useState("");
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
  // Photos, PDFs and text go through the server (photos are optimised); video and audio upload straight to private storage.
  async function attach(file: File) {
    if (files.length >= 3) throw Error("Add up to 3 attachments per message.");
    const mime = file.type || "application/octet-stream";
    setUploading(file.name);
    try {
      if (MEDIA_TYPES[mime]) {
        const d = await api(`?${new URLSearchParams({ action: "media", course: courseId, channel: selected })}`, { name: file.name, mime, size: file.size });
        const { error: uploadError } = await supabase.storage
          .from("pwd-community-media")
          .uploadToSignedUrl(d.path, d.token, file, { contentType: mime });
        if (uploadError) throw Error("Upload failed. Please check your connection and try again.");
        setFiles((old) => [...old, d.file]);
        return;
      }
      if (file.size > COMMUNITY_FILE_LIMIT) throw Error("Choose a photo or document smaller than 4 MB.");
      const r = await authFetch(
        `/api/lms-community?${new URLSearchParams({ action: "upload", course: courseId, channel: selected, name: file.name })}`,
        { method: "POST", headers: { "Content-Type": mime }, body: file },
      );
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setFiles((old) => [...old, d.file]);
    } finally {
      setUploading("");
    }
  }
  function pickFile(accept: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void run(() => attach(file));
    };
    input.click();
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
  function renderComposer() {
    if (!active) return null;
    if (!canPost && active.announcements && !active.archived)
      return (
        <p className="cm-readonly">
          <Megaphone size={15} /><CourseText text={"Announcements from your instructors. Questions? Ask in the Course lounge."} /></p>
      );
    return (
canPost ? (
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
                              // Announcement headlines are stored as a first line starting with "# ".
                              body:
                                (active.announcements && headline.trim()
                                  ? `# ${headline.trim().replace(/\n/g, " ")}\n`
                                  : "") + text.trim(),
                              client_id: draftId.current,
                              reply_to: reply?.id || thread,
                              files: files.map((f) => f.id),
                            },
                      );
                      setText("");
                      setHeadline("");
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
                      setNotice(edit ? "Message updated." : active.announcements ? "Announcement posted. Students have been notified." : "Message sent.");
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
                      ><CourseText text={"Cancel"} /></button>
                    </div>
                  )}
                  {active.announcements && !edit ? (
                    <div className="cm-announce-head">
                      <strong><Megaphone size={18} /><CourseText text={"New announcement"} /></strong>
                      <small><CourseText text={"Every student in the course is notified in the app and by email."} /></small>
                      <input
                        aria-label="Announcement headline"
                        value={headline}
                        maxLength={120}
                        disabled={busy}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Headline (optional), e.g. Class moves to 4pm on Thursday"
                      />
                    </div>
                  ) : (
                    <label htmlFor={`message-${courseId}`}>
                      {edit ? "Edit message" : `Message ${roomTitle(active)}`}
                    </label>
                  )}
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
                    placeholder={
                      active.announcements
                        ? "Write your announcement… type @ to tag a student"
                        : "Write a message… type @ to tag a student or instructor"
                    }
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
                          {p.instructor && <small><CourseText text={"Instructor"} /></small>}
                        </button>
                      ))}
                      {!matches.length && (
                        <p><CourseText text={"No matching participants in this conversation."} /></p>
                      )}
                    </div>
                  )}
                  {!!files.length && (
                    <div className="chat-files">
                      {files.map((f) => (
                        <div className="chat-file" key={f.id}>
                          {fileKind(f.mime) === "image" ? <ImagePlus size={15} /> : fileKind(f.mime) === "video" ? <Video size={15} /> : fileKind(f.mime) === "audio" ? <Music size={15} /> : <Paperclip size={15} />}
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
                          ><CourseText text={"×"} /></button>
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
                        <AtSign size={18} /><CourseText text={"Tag someone"} /></button>
                      {!edit && (
                        <>
                          <button type="button" className="lms-text" disabled={busy || files.length >= 3} onClick={() => pickFile("image/jpeg,image/png,image/webp,application/pdf,text/plain")}>
                            <ImagePlus size={18} /> <CourseText text={active.announcements ? "Banner image or file" : "Photo or file"} />
                          </button>
                          <button type="button" className="lms-text" disabled={busy || files.length >= 3} onClick={() => pickFile("video/mp4,video/webm,video/quicktime")}>
                            <Video size={18} /><CourseText text={"Video"} /></button>
                          <button type="button" className="lms-text" disabled={busy || files.length >= 3} onClick={() => pickFile("audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/webm,audio/ogg,audio/wav")}>
                            <Music size={18} /><CourseText text={"Audio"} /></button>
                          <VoiceRecorder disabled={busy || files.length >= 3} onRecorded={(file) => void run(() => attach(file))} />
                        </>
                      )}
                    </div>
                    <button
                      className="lms-button"
                      disabled={busy || !text.trim()}
                    >
                      <Send size={16} />
                      <CourseText text={busy
                        ? "Please wait…"
                        : edit
                          ? "Save edit"
                          : active.announcements
                            ? "Post announcement"
                            : "Send message"} />
                    </button>
                  </div>
                  {uploading && <p className="cm-uploading"><CourseText text={"Uploading"} />{uploading}<CourseText text={"… please keep this page open."} /></p>}
                  <small>
                    <Youtube size={13} /><CourseText text={"Paste a YouTube link to show the video · Up to 3 attachments: photos or PDFs (4 MB), audio (25 MB), video ("} /><CourseText text={instructor ? "200" : "50"} /><CourseText text={"MB)"} /></small>
                </form>
              ) : (
                <p className="lms-notice">
                  <CourseText text={active.archived
                    ? "This conversation is archived. You can still read its history."
                    : active.announcements
                      ? "Only instructors can post announcements here. Ask questions in the course lounge."
                      : "The instructor has paused new messages in this conversation."} />
                </p>
              )
    );
  }
  if (loading)
    return (
      <section className="lms-panel"><CourseText text={"Loading your course community…"} /></section>
    );
  return (
    <section
      className="lms-community chat-workspace"
      aria-label="Course community"
    >
      <header className="cm-hero">
        <div className="cm-hero-text">
          <p className="cm-eyebrow"><CourseText text={"YOUR LEARNING COMMUNITY"} /></p>
          <h2>
            <MessageCircle size={26} /> <CourseText text={privateCourse ? "Mentor conversations" : "Course community"} />
          </h2>
          <p>
            <CourseText text={privateCourse
              ? "Your private space for questions, project feedback and session plans with your mentor."
              : "Ask questions, share your work, hear announcements first and stay connected with your classmates and instructors."} />
          </p>
          <div className="cm-hero-stats">
            <span>{channels.length} <CourseText text={channels.length === 1 ? "room" : "rooms"} /></span>
            {people.length > 0 && (
              <button type="button" onClick={() => setShowPeople(true)}>
                <Users size={15} /> {people.length}<CourseText text={"people in this room"} /></button>
            )}
          </div>
        </div>
        {instructor && !privateCourse && (
          <button
            className="lms-button cm-hero-button"
            onClick={() => {
              setManage("create");
              setMemberIds([]);
            }}
          >
            <Plus size={16} /><CourseText text={"Create group"} /></button>
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
          ><CourseText text={"Retry"} /></button>
        </div>
      )}
      {notice && (
        <p className="lms-notice" role="status">
          {notice}
        </p>
      )}
      <div className="chat-mobile-rooms">
        <label><CourseText text={"Conversation"} /><select
            aria-label="Choose conversation"
            value={selected}
            disabled={busy}
            onChange={(e) => setSelected(e.target.value)}
          >
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {roomTitle(c)}
                <CourseText text={c.private ? " · Private" : ""} />
                {Number(c.mentions) > 0
                  ? ` · @${c.mentions}`
                  : Number(c.unread) > 0
                    ? ` · ${c.unread} unread`
                    : ""}
              </option>
            ))}
          </select>
        </label>
        <button className="lms-text" disabled={busy} onClick={() => run(load)}><CourseText text={"Refresh conversations"} /></button>
      </div>
      <div className="lms-community-layout">
        <aside className="lms-community-channels">
          <h3><CourseText text={"Conversations"} /></h3>
          <p className="lms-muted"><CourseText text={"Unread messages and @mentions appear here."} /></p>
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
                  <CourseText text={c.archived
                    ? "Archived"
                    : c.announcements
                      ? "Announcements"
                      : c.private
                        ? "Private group"
                        : "Course group"} />
                </small>
              </span>
              {Number(c.mentions) > 0 ? (
                <b className="chat-unread"><CourseText text={"@"} />{c.mentions}</b>
              ) : Number(c.unread) > 0 ? (
                <b className="chat-unread">{c.unread}</b>
              ) : null}
            </button>
          ))}
          <button className="lms-text" onClick={() => run(load)}><CourseText text={"Refresh conversations"} /></button>
          <p className="lms-muted"><CourseText text={"Respect your classmates. Share payment details privately with the training team."} /></p>
        </aside>
        <div className="lms-community-chat">
          {active ? (
            <>
              <header>
                <div>
                  <h3>{roomTitle(active)}</h3>
                  <p>{active.description}</p>
                  <button type="button" className="cm-people-button" onClick={() => setShowPeople((v) => !v)} aria-expanded={showPeople}>
                    <span className="cm-stack" aria-hidden="true">
                      {people.slice(0, 5).map((p) =>
                        p.avatar_url ? (
                          <img key={p.user_id} src={p.avatar_url} alt="" />
                        ) : (
                          <span key={p.user_id}>{p.name.slice(0, 1).toUpperCase()}</span>
                        ),
                      )}
                    </span>
                    {people.length ? `${people.length} people` : "Loading people…"}<CourseText text={"·"} />{" "}
                    <CourseText text={active.private ? "Private conversation" : "Students & instructors"} /><CourseText text={"·"} /><u><CourseText text={showPeople ? "Hide" : "See everyone"} /></u>
                  </button>
                </div>
                {instructor && (
                  <div className="chat-tools">
                    <button
                      className="lms-text"
                      onClick={() => setManage("settings")}
                    ><CourseText text={"Room settings"} /></button>
                    {active.private && !active.order_id && (
                      <button
                        className="lms-text"
                        onClick={() => {
                          setMemberIds(savedMembers);
                          setManage("members");
                        }}
                      ><CourseText text={"Manage members"} /></button>
                    )}
                  </div>
                )}
              </header>
              {showPeople && (
                <div className="cm-people" aria-label="People in this conversation">
                  <div className="cm-people-head">
                    <strong><CourseText text={"People in"} />{roomTitle(active)}</strong>
                    <button type="button" aria-label="Close people list" onClick={() => setShowPeople(false)}><X size={18} /></button>
                  </div>
                  <div className="cm-people-list">
                    {people.map((p) => (
                      <div key={p.user_id} className="cm-person">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" />
                        ) : (
                          <span className="cm-initial">{p.name.slice(0, 1).toUpperCase()}</span>
                        )}
                        <span className="cm-person-name">
                          {p.name}
                          {p.user_id === userId ? <small><CourseText text={"You"} /></small> : p.instructor ? <small className="cm-role"><CourseText text={"Instructor"} /></small> : <small><CourseText text={"Student"} /></small>}
                        </span>
                        {p.user_id !== userId && (
                          <span className="cm-person-actions">
                            {canPost && (
                              <button type="button" onClick={() => { tag(p); setShowPeople(false); document.getElementById(`message-${courseId}`)?.focus(); }}>
                                <AtSign size={14} /><CourseText text={"Mention"} /></button>
                            )}
                            <a href={`/training-center/dashboard?tab=messages&with=${p.user_id}`}>
                              <MessageCircle size={14} /><CourseText text={"Message"} /></a>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <button className="lms-text"><CourseText text={"Search"} /></button>
                {search && (
                  <button
                    type="button"
                    className="lms-text"
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                    }}
                  ><CourseText text={"Clear"} /></button>
                )}
              </form>
              {thread && (
                <div className="chat-thread-bar">
                  <button className="lms-text" onClick={() => setThread(null)}>
                    <ArrowLeft size={16} /><CourseText text={"All messages"} /></button>
                  <strong><CourseText text={"Reply thread"} /></strong>
                </div>
              )}
              {!!pinned.length && (
                <details className="chat-pins">
                  <summary>
                    <Pin size={15} /><CourseText text={"Pinned messages ("} />{pinned.length}<CourseText text={")"} /></summary>
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
                  <summary><CourseText text={"Reports to review ("} />{reports.length}<CourseText text={")"} /></summary>
                  {reports.map((r) => (
                    <div key={r.id}>
                      <p>{r.reason}</p>
                      <button
                        className="lms-text"
                        onClick={() => setThread(r.message_id)}
                      ><CourseText text={"View message"} /></button>
                      <button
                        className="lms-text"
                        disabled={busy}
                        onClick={() =>
                          run(() => act("resolve", { report_id: r.id }))
                        }
                      ><CourseText text={"Mark reviewed"} /></button>
                    </div>
                  ))}
                </details>
              )}
              {active.announcements && renderComposer()}
              <div
                ref={scrollBox}
                onScroll={markRead}
                className="lms-message-list"
                aria-label="Messages"
              >
                {older && (
                  <div className="lms-notice"><CourseText text={"Live updates are paused while you browse older messages."} />{" "}
                    <button
                      onClick={() =>
                        run(async () => {
                          firstFeed.current = true;
                          await refreshMessages();
                        })
                      }
                    ><CourseText text={"Back to latest"} /></button>
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
                  ><CourseText text={"Load earlier messages"} /></button>
                )}
                {!messages.length && !error && (
                  <div className="lms-empty cm-empty">
                    {active.announcements ? <Megaphone size={28} /> : <MessageCircle size={28} />}
                    <h3>
                      <CourseText text={search
                        ? "No matching messages"
                        : "Start the conversation"} />
                    </h3>
                    <p>
                      <CourseText text={search
                        ? "Try a different word or clear your search."
                        : active.announcements
                          ? canPost
                            ? "Post your first announcement above. Students are notified straight away."
                            : "Announcements from your instructors will appear here."
                          : "Introduce yourself, ask a question or share what you’re building. Use the message box below."} />
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <article
                    id={`chat-message-${m.id}`}
                    key={m.id}
                    className={`lms-message ${m.user_id === userId ? "own" : ""} ${m.body.includes(`](${userId})`) ? "chat-tagged" : ""} ${active?.announcements ? "cm-announcement" : ""}`}
                  >
                    <div>
                      <span className="chat-avatar" aria-hidden="true">
                        {m.author_name.slice(0, 1).toUpperCase()}
                      </span>
                      <strong>{m.author_name}</strong>
                      {m.instructor && (
                        <span className="lms-pill"><CourseText text={"Instructor"} /></span>
                      )}
                      <time dateTime={m.created_at}>
                        {new Date(m.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      {m.edited_at && <small><CourseText text={"Edited"} /></small>}
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
                    {(() => {
                      // "# Headline" first line, banner image first on announcements, then text, media and YouTube.
                      const nl = m.body.indexOf("\n");
                      const hasHeading = !m.deleted && m.body.startsWith("# ");
                      const heading = hasHeading ? m.body.slice(2, nl === -1 ? undefined : nl).trim() : "";
                      const text = hasHeading ? (nl === -1 ? "" : m.body.slice(nl + 1)) : m.body;
                      const images = m.files.filter((f) => fileKind(f.mime) === "image");
                      const banner = active?.announcements ? images[0] : undefined;
                      const yt = m.deleted ? null : youtubeId(m.body);
                      return (
                        <>
                          {banner && (
                            <MediaView file={banner} courseId={courseId} channelId={selected} banner onDownload={() => run(() => download(banner))} />
                          )}
                          {heading && <h4 className="cm-headline">{heading}</h4>}
                          {text && (
                            <p>
                              <Body body={text} userId={userId} />
                            </p>
                          )}
                          {m.files.filter((f) => f !== banner).length > 0 && (
                            <div className="cm-media">
                              {m.files
                                .filter((f) => f !== banner)
                                .map((f) => (
                                  <MediaView key={f.id} file={f} courseId={courseId} channelId={selected} onDownload={() => run(() => download(f))} />
                                ))}
                            </div>
                          )}
                          {yt && <YouTubeEmbed id={yt} />}
                        </>
                      );
                    })()}
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
                            ><CourseText text={"Reply"} /></button>
                          )}
                          <button onClick={() => setThread(m.reply_to || m.id)}><CourseText text={"Open thread"} /></button>
                          {m.user_id === userId && canPost && (
                            <button
                              onClick={() => {
                                setEdit(m);
                                setText(m.body);
                                setReply(null);
                              }}
                            ><CourseText text={"Edit"} /></button>
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
                              <CourseText text={m.pinned ? "Unpin" : "Pin"} />
                            </button>
                          )}
                          {(instructor || m.user_id === userId) && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                run(() => act("delete", { id: m.id }))
                              }
                            ><CourseText text={"Remove"} /></button>
                          )}
                          {!instructor && m.user_id !== userId && (
                            <button onClick={() => setReportTarget(m.id)}><CourseText text={"Report"} /></button>
                          )}
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
              {!active.announcements && renderComposer()}
            </>
          ) : (
            <div className="lms-empty">
              <CourseText text={privateCourse
                ? "A private mentor conversation will appear for each student when their payment or course access is approved."
                : "No conversations available yet."} />
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
          <h3><CourseText text={"Report this message"} /></h3>
          <label><CourseText text={"Reason"} /><textarea name="reason" required minLength={5} maxLength={500} />
          </label>
          <button className="lms-button" disabled={busy}><CourseText text={"Send report"} /></button>
          <button
            type="button"
            className="lms-text"
            onClick={() => setReportTarget(null)}
          ><CourseText text={"Cancel"} /></button>
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
                <label><CourseText text={"Group name"} />{manage === "settings" && active?.order_id ? (
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
                <label><CourseText text={"Description"} /><textarea
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
                  /><CourseText text={"Only instructors can post announcements"} /></label>
              </>
            )}
            {manage === "create" && (
              <label className="lms-check">
                <input type="checkbox" name="private" defaultChecked /><CourseText text={"Private group: selected students and instructors only"} /></label>
            )}
            {manage === "settings" ? (
              <>
                <label className="lms-check">
                  <input
                    type="checkbox"
                    name="locked"
                    defaultChecked={active?.locked}
                  /><CourseText text={"Pause student messages"} /></label>
                <label className="lms-check">
                  <input
                    type="checkbox"
                    name="archived"
                    defaultChecked={active?.archived}
                  /><CourseText text={"Archive this conversation (keep history)"} /></label>
                <p><CourseText text={"Privacy is fixed when a group is created, so private conversations cannot accidentally become public."} /></p>
              </>
            ) : (
              <>
                <p><CourseText text={"Choose students for this private group. Instructors always have access."} /></p>
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
                  <p><CourseText text={"No enrolled students yet."} /></p>
                )}
              </>
            )}
            <button className="lms-button"><CourseText text={"Save conversation"} /></button>
            <button
              type="button"
              className="lms-text"
              onClick={() => setManage(null)}
            ><CourseText text={"Cancel"} /></button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
