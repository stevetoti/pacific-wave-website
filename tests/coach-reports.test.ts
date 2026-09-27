import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { publicAddress, verifySourceLink } from "../src/lib/server/coach-links";
import { plainText } from "../src/lib/lms/coach/report";
test("research source checks reject local, private, mapped and unsafe URLs", async () => {
  for (const ip of [
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "192.168.0.1",
    "172.20.1.1",
    "100.64.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
  ])
    assert.equal(publicAddress(ip), false, ip);
  assert.equal(publicAddress("1.1.1.1"), true);
  assert.equal(publicAddress("2606:4700::1111"), true);
  for (const url of [
    "http://example.com",
    "https://127.0.0.1",
    "https://[::1]",
    "https://user:password@example.com",
    "https://example.com:444",
    "file:///etc/passwd",
  ])
    assert.equal(await verifySourceLink(url), null);
  assert.equal(
    plainText("## **Learning**\n[Official source](https://example.com)"),
    "Learning\nOfficial source",
  );
});
test("report jobs queue once, lease exclusively, retry and isolate live research", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table pwd_lms_courses(id uuid primary key,private_sessions boolean default false);create table pwd_lms_lessons(id uuid primary key);",
    );
    for (const file of [
      "20260925_student_video_coaches.sql",
      "20260925_add_specialist_coaches.sql",
      "20260926_coach_orientation.sql",
      "20260927_coach_reports.sql",
    ])
      await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
    const u = crypto.randomUUID(),
      other = crypto.randomUUID(),
      c = crypto.randomUUID();
    await db.query("insert into auth.users values($1),($2)", [u, other]);
    await db.query("insert into pwd_lms_courses(id) values($1)", [c]);
    const sid = (
      await db.query<{ id: string }>(
        "select pwd_lms_coach_reserve($1,$2,null,'business') id",
        [u, c],
      )
    ).rows[0].id;
    await db.query(
      "update pwd_lms_coach_sessions set state='active' where id=$1",
      [sid],
    );
    await assert.rejects(
      db.query("select pwd_coach_reserve_research($1,$2,'topic')", [
        other,
        sid,
      ]),
      /inactive_session/,
    );
    for (let i = 0; i < 6; i++)
      await db.query("select pwd_coach_reserve_research($1,$2,'topic')", [
        u,
        sid,
      ]);
    await assert.rejects(
      db.query("select pwd_coach_reserve_research($1,$2,'topic')", [u, sid]),
      /research_limit/,
    );
    await db.query(
      "update pwd_lms_coach_sessions set state='ended' where id=$1",
      [sid],
    );
    await db.query(
      "update pwd_lms_coach_sessions set state='ended' where id=$1",
      [sid],
    );
    assert.equal(
      (await db.query("select * from pwd_lms_coach_reports")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from pwd_coach_claim_report($1)", [sid])).rows
        .length,
      1,
    );
    assert.equal(
      (await db.query("select * from pwd_coach_claim_report($1)", [sid])).rows
        .length,
      0,
    );
    await db.query(
      "update pwd_lms_coach_reports set locked_until=now()-interval '1 second'",
    );
    assert.equal(
      (
        await db.query<{ attempts: number }>(
          "select * from pwd_coach_claim_report($1)",
          [sid],
        )
      ).rows[0].attempts,
      2,
    );
    await db.query(
      "update pwd_lms_coach_reports set report='{}',state='ready',email_state='sent',locked_until=null",
    );
    assert.equal(
      (await db.query("select * from pwd_coach_claim_report($1)", [sid])).rows
        .length,
      0,
    );
    const access = (
      await db.query<{ ok: boolean }>(
        "select not has_table_privilege('authenticated','pwd_lms_coach_reports','SELECT') and not has_table_privilege('anon','pwd_lms_coach_preferences','SELECT') and not has_function_privilege('authenticated','pwd_coach_claim_report(uuid)','EXECUTE') ok",
      )
    ).rows[0];
    assert.ok(access.ok);
    await db.query("delete from pwd_lms_coach_sessions where id=$1", [sid]);
    assert.equal(
      (await db.query("select * from pwd_lms_coach_reports")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from pwd_lms_coach_research")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
import { processCoachReports } from "../src/lib/server/coach-report-worker";
test("report email uses the account address, an idempotency key, escaped HTML and PDF attachment", async () => {
  const original = globalThis.fetch,
    old = { ...process.env };
  const id = crypto.randomUUID();
  const report = {
    title: "My <business> plan",
    summary: "Useful & private",
    discussion: [],
    learning_gaps: [],
    research: [],
    actions: [],
    limitations: [],
    sources: [],
    course_title: "Course",
    coach_title: "Coach",
    student_name: "Student <script>",
    session_date: "2026-09-27",
    created_at: "2026-09-27",
  };
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://report-tests.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test";
    process.env.RESEND_API_KEY = "test";
    for (const live of [false, true]) {
      process.env.VERCEL_ENV = live ? "production" : "preview";
      process.env.TRAINING_EMAIL_MODE = "live";
      const sent: {
        url: string;
        body: Record<string, unknown>;
        headers: Headers;
      }[] = [];
      globalThis.fetch = async (input, init) => {
        const url = String(input),
          body = init?.body ? JSON.parse(String(init.body)) : {};
        sent.push({ url, body, headers: new Headers(init?.headers) });
        let data: unknown = [];
        if (url.includes("/rpc/pwd_coach_claim_report"))
          data = [
            {
              session_id: id,
              report,
              email_attempts: 0,
              attempts: 1,
              locked_until: "2026-09-27",
            },
          ];
        else if (
          url.includes("/pwd_lms_coach_sessions?") &&
          (!init?.method || init.method === "GET")
        )
          data = {
            id,
            user_id: "a14d665e-6ec5-4cb4-af53-fd22629e73c7",
            course_id: "course-id",
            role: "business",
          };
        else if (url.includes("/pwd_lms_coach_preferences?"))
          data = { consent_version: "2026-09-27" };
        else if (url.includes("/pwd_lms_courses?")) data = { title: "Course" };
        else if (url.includes("/pwd_lms_profiles?"))
          data = { full_name: "Student" };
        else if (url.includes("/auth/v1/admin/users/"))
          data = {
            id: "a14d665e-6ec5-4cb4-af53-fd22629e73c7",
            email: "student@example.com",
          };
        else if (url === "https://api.resend.com/emails")
          data = { id: "receipt" };
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };
      await processCoachReports(id);
      const email = sent.find((s) => s.url === "https://api.resend.com/emails");
      assert.ok(
        email,
        JSON.stringify(sent.map((s) => ({ url: s.url, body: s.body }))),
      );
      assert.equal(
        email.body.to,
        live ? "student@example.com" : "delivered@resend.dev",
      );
      assert.equal(
        email.headers.get("Idempotency-Key"),
        "pwd-coach-report-" + id,
      );
      assert.ok(!("bcc" in email.body));
      assert.match(String(email.body.html), /Student &lt;script&gt;/);
      const attachment = (email.body.attachments as { content: string }[])[0];
      assert.equal(
        Buffer.from(attachment.content, "base64").subarray(0, 4).toString(),
        "%PDF",
      );
      assert.ok(
        sent.some(
          (s) =>
            s.body.provider_id === "receipt" && s.body.email_state === "sent",
        ),
      );
    }
  } finally {
    globalThis.fetch = original;
    for (const key of [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "RESEND_API_KEY",
      "VERCEL_ENV",
      "TRAINING_EMAIL_MODE",
    ]) {
      if (old[key] === undefined) delete process.env[key];
      else process.env[key] = old[key];
    }
  }
});
