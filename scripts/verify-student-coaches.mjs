import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const base = "http://localhost:3105",
  url = process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(new URL(url).hostname, "rndegttgwtpkbjtvjgnc.supabase.co");
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const check = async (p) => {
  const r = await p;
  if (r.error) throw r.error;
  return r.data;
};
const users = [],
  courses = [],
  orders = [];
let browser;
const lit = (s) => "'" + String(s).replaceAll("'", "''") + "'";
async function sql(query) {
  const r = await fetch(
    "https://api.supabase.com/v1/projects/rndegttgwtpkbjtvjgnc/database/query",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.SUPABASE_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!r.ok) throw Error("SQL " + r.status);
  return r.json();
}
async function api(user, course, body, lesson) {
  const r = await fetch(
    `${base}/api/lms-coach?course=${course}${lesson ? "&lesson=" + lesson : ""}`,
    {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: "Bearer " + (user?.session.access_token || ""),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(45000),
    },
  );
  return { status: r.status, data: await r.json() };
}
try {
  for (let i = 0; i < 2; i++) {
    const email = `coach-qa-${randomUUID()}@example.com`,
      password = `QA-${randomUUID()}!`;
    const { user } = await check(
      db.auth.admin.createUser({ email, password, email_confirm: true }),
    );
    users.push({ id: user.id, email });
    const auth = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    users[i].session = (
      await check(auth.auth.signInWithPassword({ email, password }))
    ).session;
  }
  for (const priv of [false, true])
    courses.push(
      await check(
        db
          .from("pwd_lms_courses")
          .insert({
            slug: "coach-qa-" + randomUUID(),
            title: priv ? "Private coaching QA" : "Student video tutor QA",
            description: "Coach integration verification",
            introduction: "Learn positioning and create a useful offer.",
            kind: "live",
            amount: 100,
            currency: "VUV",
            published: false,
            private_sessions: priv,
          })
          .select()
          .single(),
      ),
    );
  for (const c of courses)
    for (let i = 0; i < 2; i++) {
      const id = randomUUID();
      orders.push({ id, course_id: c.id, user_id: users[i].id });
      await sql(
        `begin;insert into pwd_lms_orders(id,user_id,course_id,email,name,phone,amount,currency,status) values(${[id, users[i].id, c.id, users[i].email, i ? "Other Student" : "Alex Coach Test", "1234567"].map(lit).join(",")},100,'VUV','paid');delete from pwd_lms_emails where order_id=${lit(id)};commit;`,
      );
    }
  await check(
    db.from("pwd_lms_profiles").upsert({
      user_id: users[0].id,
      full_name: "Alex Coach Test",
      learning_goals: "Build a tourism business",
    }),
  );
  const lesson = await check(
    db
      .from("pwd_lms_lessons")
      .insert({
        course_id: courses[0].id,
        title: "Positioning your offer",
        content: "An offer describes a customer problem and a specific result.",
        position: 1,
        published: true,
      })
      .select()
      .single(),
  );
  const otherLesson = await check(
    db
      .from("pwd_lms_lessons")
      .insert({
        course_id: courses[1].id,
        order_id: orders[3].id,
        title: "Other private lesson",
        content: "SECRET_OTHER_STUDENT",
        position: 1,
        published: true,
      })
      .select()
      .single(),
  );
  const ownLesson = await check(
    db
      .from("pwd_lms_lessons")
      .insert({
        course_id: courses[1].id,
        order_id: orders[2].id,
        title: "My private lesson",
        content: "My software project",
        position: 2,
        published: true,
      })
      .select()
      .single(),
  );
  assert.equal((await api(null, courses[0].id)).status, 401);
  assert.equal((await api(users[0], randomUUID())).status, 403);
  const context = await api(users[0], courses[0].id, null, lesson.id);
  assert.equal(context.status, 200);
  assert.match(JSON.stringify(context.data.context), /tourism/);
  const privateContext = await api(users[0], courses[1].id);
  assert.equal(privateContext.status, 200);
  assert.ok(!JSON.stringify(privateContext).includes("SECRET_OTHER_STUDENT"));
  assert.equal(
    (await api(users[0], courses[1].id, null, otherLesson.id)).status,
    403,
  );
  assert.equal(
    (await api(users[0], courses[1].id, null, ownLesson.id)).status,
    200,
  );
  const notes =
    "My goal is a tourism offer. Next step: interview two customers.";
  assert.equal(
    (
      await api(users[0], courses[0].id, {
        action: "notes",
        course_id: courses[0].id,
        notes,
      })
    ).status,
    200,
  );
  assert.equal((await api(users[1], courses[0].id)).data.notes, "");
  assert.equal(
    (
      await api(users[0], courses[0].id, {
        action: "start",
        course_id: courses[0].id,
        role: "onboarding",
        consent: false,
      })
    ).status,
    400,
  );
  browser = await chromium.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });
  for (const role of ["sales_practice", "marketing_content", "project_review"]) {
    const started = await api(users[0], courses[0].id, {action:"start",course_id:courses[0].id,role,consent:true});
    assert.equal(started.status, 200, role + " starts");
    assert.ok(started.data.session_token || started.data.token);
    const ended = await api(users[0], courses[0].id, {action:"end",course_id:courses[0].id,session_id:started.data.session_id,transcript:[]});
    assert.equal(ended.status, 200);
    assert.equal(ended.data.saved, true);
  }
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      permissions: ["microphone"],
    });
    await ctx.addInitScript(
      ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
      { key: "sb-rndegttgwtpkbjtvjgnc-auth-token", session: users[0].session },
    );
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/training-center/course/${courses[0].id}`);
    await page
      .getByRole("button", { name: /Your personal AI faculty/ })
      .click();
    await page
      .getByRole("heading", { name: "Onboarding Tutor", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Start video conversation" })
      .first()
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Start video conversation" })
        .count(),
      7,
    );
    await page
      .getByLabel("Coaching notes")
      .fill(notes + " Updated in browser.");
    await page.getByRole("button", { name: "Save coaching notes" }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Coaching notes saved" })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      true,
    );
    await page.screenshot({
      path: `.deployment/student-coaches-${width}.png`,
      fullPage: true,
    });
    if (width === 1280) {
      await page.getByRole("checkbox", { name: /I agree to share/ }).check();
      await page.getByRole("checkbox", { name: /Type instead/ }).check();
      await page
        .getByRole("button", { name: "Start video conversation" })
        .first()
        .click();
      await page.getByLabel("Message your tutor").waitFor();
      await page.waitForFunction(
        () => {
          const v = document.getElementById("pwd-coach-video");
          return (
            v instanceof HTMLVideoElement &&
            v.readyState >= 2 &&
            v.videoWidth > 0
          );
        },
        {},
        { timeout: 60000 },
      );
      console.log("Real Anam video frame received.");
      await page
        .getByLabel("Message your tutor")
        .fill("Please greet me by name and tell me what my learning goal is.");
      await page.getByRole("button", { name: "Send", exact: true }).click();
      await page
        .getByLabel("Live transcript")
        .getByText(/tourism/i)
        .waitFor({ timeout: 45000 });
      await page.getByRole("button", { name: "Minimize video" }).click();
      await page
        .getByRole("button", { name: /Positioning your offer/ })
        .click();
      await page.getByRole("button", { name: "Expand video" }).click();
      await page
        .getByRole("status")
        .filter({ hasText: /remaining.*Positioning your offer/ })
        .waitFor();
      await page.screenshot({
        path: ".deployment/student-coach-video.png",
        fullPage: true,
      });
      await page.getByRole("button", { name: "End video session" }).click();
      await page
        .getByRole("status")
        .filter({ hasText: "Session saved" })
        .waitFor();
      const saved = await api(users[0], courses[0].id);
      assert.ok(saved.data.history[0].transcript.length > 0);
      assert.ok(
        saved.data.history[0].transcript.some(
          (l) => l.role === "user" && l.content.includes("learning goal"),
        ),
      );
    }
    assert.deepEqual(errors, []);
    await ctx.close();
  }
  console.log(
    "PASS: authentication, course/private lesson isolation, consent, notes privacy, desktop/mobile, real Anam video and personalized response, lesson navigation, transcript persistence.",
  );
} catch (e) {
  if (browser)
    for (const c of browser.contexts())
      for (const p of c.pages()) {
        await p
          .screenshot({
            path: ".deployment/student-coach-failure.png",
            fullPage: true,
          })
          .catch(() => {});
        console.log((await p.locator("body").innerText()).slice(-2500));
      }
  throw e;
} finally {
  if (browser) await browser.close();
  await writeFile(
    ".deployment/coach-test-fixtures.json",
    JSON.stringify({
      users: users.map((u) => u.id),
      courses: courses.map((c) => c.id),
      orders: orders.map((o) => o.id),
    }),
  );
  for (const c of courses) {
    for (const table of [
      "pwd_lms_coach_sessions",
      "pwd_lms_coach_notes",
      "pwd_lms_channels",
      "pwd_lms_lessons",
      "pwd_lms_orders",
    ])
      await check(db.from(table).delete().eq("course_id", c.id));
    await check(db.from("pwd_lms_courses").delete().eq("id", c.id));
  }
  for (const u of users) {
    await check(db.from("pwd_lms_profiles").delete().eq("user_id", u.id));
    await check(db.auth.admin.deleteUser(u.id));
  }
  console.log("Removed temporary coaching accounts, courses and records.");
}
