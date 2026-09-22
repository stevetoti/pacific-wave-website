"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, LockKeyhole, Send, Plus, Users } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
type Channel = {
  id: string;
  name: string;
  description: string;
  private: boolean;
  announcements: boolean;
};
type Message = {
  id: number;
  user_id: string;
  author_name: string;
  instructor: boolean;
  body: string;
  deleted: boolean;
  created_at: string;
};
async function api(path: string, body?: unknown) {
  const r = await authFetch(
    "/api/lms-community" + path,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Community unavailable.");
  return d;
}
export default function CourseCommunity({ courseId }: { courseId: string }) {
  const [channels, setChannels] = useState<Channel[]>([]),
    [selected, setSelected] = useState(""),
    [messages, setMessages] = useState<Message[]>([]),
    [instructor, setInstructor] = useState(false),
    [userId, setUserId] = useState(""),
    [people, setPeople] = useState<{ user_id: string; name: string }[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [text, setText] = useState(""),
    [more, setMore] = useState(false),
    [manage, setManage] = useState<"create" | "members" | null>(null),
    [memberIds, setMemberIds] = useState<string[]>([]),
    [notice, setNotice] = useState("");
  const historyLoaded = useRef(false);
  const draftId = useRef(crypto.randomUUID());
  const active = channels.find((c) => c.id === selected);
  const load = useCallback(async () => {
    const d = await api(`?course=${courseId}`);
    setChannels(d.channels);
    setInstructor(d.instructor);
    setUserId(d.user_id);
    setPeople(d.people);
    setSelected((id) =>
      d.channels.some((c: Channel) => c.id === id)
        ? id
        : d.channels[0]?.id || "",
    );
  }, [courseId]);
  useEffect(() => {
    setSelected("");
    setMessages([]);
    setError("");
    setLoading(true);
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);
  useEffect(() => {
    if (!selected) return;
    let live = true;
    setMessages([]);
    historyLoaded.current = false;
    setText("");
    setManage(null);
    draftId.current = crypto.randomUUID();
    const refresh = async () => {
      try {
        const d = await api(`?course=${courseId}&channel=${selected}`);
        if (live) {
          setMessages((previous) => {
            const oldest = d.messages[0]?.id;
            return [
              ...previous.filter((m) => oldest && m.id < oldest),
              ...d.messages,
            ];
          });
          if (!historyLoaded.current) setMore(d.has_more);
          setError("");
        }
      } catch (e) {
        if (live) {
          setMessages([]);
          setError(
            e instanceof Error ? e.message : "Unable to refresh discussion.",
          );
        }
      }
    };
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 8000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [courseId, selected]);
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function refreshMessages() {
    const d = await api(`?course=${courseId}&channel=${selected}`);
    setMessages(d.messages);
    setMore(d.has_more);
  }
  if (loading)
    return (
      <section className="lms-panel">Loading your course community…</section>
    );
  return (
    <section className="lms-community" aria-label="Course community">
      <header className="lms-community-heading">
        <div>
          <p className="lms-eyebrow">LEARN TOGETHER</p>
          <h2>
            <MessageCircle size={25} /> Your course community
          </h2>
          <p>
            Ask questions, share progress and learn with your classmates and
            instructors.
          </p>
        </div>
        {instructor && (
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
        <p role="status" className="lms-notice">
          {notice}
        </p>
      )}
      <div className="lms-community-layout">
        <aside className="lms-community-channels">
          <h3>Course rooms</h3>
          <button
            className="lms-text lms-room-refresh"
            onClick={() => run(load)}
          >
            Refresh rooms
          </button>
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              aria-pressed={selected === c.id}
              className={selected === c.id ? "selected" : ""}
            >
              {c.private ? <LockKeyhole size={17} /> : <Users size={17} />}
              <span>
                {c.name}
                <small>
                  {c.private
                    ? "Private group"
                    : c.announcements
                      ? "Instructor updates"
                      : "Open to the course"}
                </small>
              </span>
            </button>
          ))}
          <p className="lms-muted">
            Be respectful. Keep personal details and payment information out of
            chat. Instructors can moderate discussions.
          </p>
        </aside>
        <div className="lms-community-chat">
          {active && (
            <>
              <header>
                <div>
                  <h3>{active.name}</h3>
                  <p>{active.description}</p>
                </div>
                {instructor && active.private && (
                  <button
                    className="lms-text"
                    onClick={() =>
                      run(async () => {
                        const d = await api(
                          `?course=${courseId}&channel=${selected}`,
                        );
                        setMemberIds(d.members || []);
                        setManage("members");
                      })
                    }
                  >
                    Manage members
                  </button>
                )}
              </header>
              <div className="lms-message-list" aria-label="Messages">
                {more && (
                  <button
                    className="lms-text"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const d = await api(
                          `?course=${courseId}&channel=${selected}&before=${messages[0]?.id}`,
                        );
                        historyLoaded.current = true;
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
                    <h3>Start the conversation</h3>
                    <p>
                      {active.announcements
                        ? "Your instructor will post course updates here."
                        : "Introduce yourself, share what you are building or ask a question."}
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <article
                    key={m.id}
                    className={`lms-message ${m.user_id === userId ? "own" : ""}`}
                  >
                    <div>
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
                    </div>
                    <p>{m.body}</p>
                    {!m.deleted && (instructor || m.user_id === userId) && (
                      <button
                        className="lms-text"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api("", {
                              action: "delete",
                              course: courseId,
                              channel: selected,
                              id: m.id,
                            });
                            await refreshMessages();
                          })
                        }
                      >
                        Remove
                      </button>
                    )}
                  </article>
                ))}
              </div>
              {!active.announcements || instructor ? (
                <form
                  className="lms-message-compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const body = text.trim();
                    if (!body) return;
                    run(async () => {
                      await api("", {
                        action: "send",
                        course: courseId,
                        channel: selected,
                        body,
                        client_id: draftId.current,
                      });
                      setText("");
                      draftId.current = crypto.randomUUID();
                      await refreshMessages();
                      setNotice("Message sent.");
                    });
                  }}
                >
                  <label htmlFor={`message-${courseId}`}>
                    Message {active.name}
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
                    placeholder="Share an idea or ask a question…"
                  />
                  <div>
                    <span>{text.length}/2,000 · Updates automatically</span>
                    <button
                      className="lms-button"
                      disabled={busy || !text.trim()}
                    >
                      <Send size={16} /> Send message
                    </button>
                  </div>
                </form>
              ) : (
                <p className="lms-notice">
                  Only instructors post here. Ask questions in the course
                  lounge.
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {manage && instructor && (
        <form
          className="lms-panel lms-group-editor"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(async () => {
              if (manage === "create") {
                const d = await api("", {
                  action: "create",
                  course: courseId,
                  name: f.get("name"),
                  description: f.get("description"),
                  private: f.get("private") === "on",
                  members: memberIds,
                });
                await load();
                setSelected(d.id);
              } else
                await api("", {
                  action: "members",
                  course: courseId,
                  channel: selected,
                  members: memberIds,
                });
              setManage(null);
              setNotice("Group saved.");
            });
          }}
        >
          <h3>
            {manage === "create"
              ? "Create a course group"
              : `Members of ${active?.name}`}
          </h3>
          <fieldset disabled={busy}>
            {manage === "create" && (
              <>
                <label>
                  Group name
                  <input name="name" required minLength={2} maxLength={80} />
                </label>
                <label>
                  Description
                  <textarea name="description" maxLength={500} />
                </label>
                <label className="lms-check">
                  <input type="checkbox" name="private" defaultChecked />
                  Private: only selected students and instructors can access
                </label>
              </>
            )}
            <p>
              Select members for this private group. Public groups are open to
              all paid students in the course.
            </p>
            {people.length ? (
              people.map((p) => (
                <label className="lms-check" key={p.user_id}>
                  <input
                    type="checkbox"
                    checked={memberIds.includes(p.user_id)}
                    onChange={(e) =>
                      setMemberIds((ids) =>
                        e.target.checked
                          ? [...ids, p.user_id]
                          : ids.filter((id) => id !== p.user_id),
                      )
                    }
                  />
                  {p.name}
                </label>
              ))
            ) : (
              <p>No paid students yet. You can add members after they enrol.</p>
            )}
            <button className="lms-button">Save group</button>
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
