import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { notificationTemplate } from "../src/lib/email/notification-template";

test("notifications merge bursts, skip the sender and are claimed once for email", async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);");
    await db.exec(await readFile("supabase/migrations/20260930_notifications.sql", "utf8"));
    const [ana, ben, cai] = Array.from({ length: 3 }, () => crypto.randomUUID());
    for (const id of [ana, ben, cai]) await db.query("INSERT INTO auth.users VALUES($1,$2)", [id, id + "@x.test"]);
    const notify = (users: string[], group: string, body: string, delay = 0) =>
      db.query("SELECT pwd_lms_notify($1::uuid[],'message',$2,$3,'Ana',$4,'/link',$5)", [users, ana, group, body, delay]);
    await notify([ben, ana], "dm:1", "first");
    await notify([ben], "dm:1", "second");
    await notify([ben], "dm:1", "third");
    let rows = (await db.query<{ user_id: string; count: number; body: string }>("SELECT * FROM pwd_lms_notifications")).rows;
    assert.equal(rows.length, 1, "sender is never notified and bursts merge");
    assert.equal(rows[0].user_id, ben);
    assert.equal(rows[0].count, 3);
    assert.equal(rows[0].body, "third");
    // A future-due notification is not claimed yet.
    await notify([cai], "announce:9", "later", 600);
    const claimed = (await db.query<{ user_id: string }>("SELECT * FROM pwd_lms_claim_notification_emails(10)")).rows;
    assert.deepEqual(claimed.map((c) => c.user_id), [ben]);
    assert.equal((await db.query("SELECT * FROM pwd_lms_claim_notification_emails(10)")).rows.length, 0, "claimed once");
    // Once claimed, a new message starts a new notification (a new email batch).
    await notify([ben], "dm:1", "fourth");
    rows = (await db.query<{ user_id: string; count: number; body: string }>("SELECT * FROM pwd_lms_notifications WHERE user_id=$1 ORDER BY created_at", [ben])).rows;
    assert.equal(rows.length, 2);
    // Reading clears the unsent batch so it is not merged into.
    await db.query("UPDATE pwd_lms_notifications SET read_at=now() WHERE user_id=$1", [ben]);
    await notify([ben], "dm:1", "fifth");
    assert.equal((await db.query("SELECT 1 FROM pwd_lms_notifications WHERE user_id=$1 AND read_at IS NULL", [ben])).rows.length, 1);
    // Stale "sending" claims are retried, at most three attempts.
    await db.query("UPDATE pwd_lms_notifications SET email_state='sending',email_due_at=now()-interval '1 minute',email_attempts=3 WHERE body='third'");
    const retried = (await db.query<{ body: string }>("SELECT * FROM pwd_lms_claim_notification_emails(10)")).rows;
    assert.ok(!retried.some((c) => c.body === "third"), "gives up after three attempts");
  } finally {
    await db.close();
  }
});

test("notification email escapes content and includes opt-out", () => {
  const { html, text } = notificationTemplate({
    heading: "Ana sent you a message",
    intro: "Reply on the Training Centre.",
    actorName: "Ana <script>",
    actorHeadline: "",
    actorAvatar: "",
    quote: "Hi <b>there</b>",
    action: "Reply",
    url: "https://pacificwavedigital.com/x",
    settingsUrl: "https://pacificwavedigital.com/s",
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("Hi &lt;b&gt;there&lt;/b&gt;"));
  assert.ok(html.includes("Turn off message emails"));
  assert.ok(text.includes("https://pacificwavedigital.com/s"));
});
