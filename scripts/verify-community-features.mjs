// Isolated live-database/local-API verification. Never run against a production API.
// Start localhost with TRAINING_EMAIL_MODE=disabled VERCEL_ENV=preview ERROR_NOTIFICATION_EMAILS=.
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { writeFile, unlink } from "node:fs/promises";
import { chromium } from "@playwright/test";
import sharp from "sharp";
const base = "http://localhost:3102",
  url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const check = async (p) => {
  const r = await p;
  if (r.error) throw r.error;
  return r.data;
};
const ref = new URL(url).hostname.split(".")[0];
assert.equal(ref, "rndegttgwtpkbjtvjgnc");
const users = [],
  courses = [],
  orders = [];
let browser;
const manifest = ".deployment/community-features-fixtures.json";
const save = () =>
  writeFile(
    manifest,
    JSON.stringify(
      {
        users: users.map(({ id, email }) => ({ id, email })),
        courses: courses.map((c) => c.id),
        orders: orders.map((o) => o.id),
      },
      null,
      2,
    ),
  );
async function sql(query) {
  const r = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!r.ok) throw Error("Fixture SQL failed " + r.status);
  return r.json();
}
const literal = (value) => "'" + String(value).replace(/'/g, "''") + "'";
let requestNumber = 0;
async function api(user, body, query = "") {
  const n = ++requestNumber;
  console.log("API", n, body?.action || "read");
  const r = await fetch(base + "/api/lms-community" + query, {
    signal: AbortSignal.timeout(45000),
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${user?.session?.access_token || ""}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  console.log("API result", n, r.status);
  return { status: r.status, data };
}
const expect = async (p, status = 200) => {
  const r = await p;
  assert.equal(r.status, status, JSON.stringify(r.data));
  return r.data;
};
async function seedOrder(user, course, name) {
  const id = randomUUID();
  orders.push({ id, course_id: course.id, user_id: user.id });
  await save();
  await sql(
    `BEGIN;INSERT INTO pwd_lms_orders(id,user_id,course_id,email,name,phone,amount,currency,status) VALUES(${[id, user.id, course.id, user.email, name, "1234567"].map(literal).join(",")},100,'VUV','paid');DELETE FROM pwd_lms_emails WHERE order_id=${literal(id)};COMMIT;`,
  );
  Object.assign(
    orders.at(-1),
    await check(db.from("pwd_lms_orders").select("*").eq("id", id).single()),
  );
  return orders.at(-1);
}
try {
  for (let i = 0; i < 4; i++) {
    const email = `community-advanced-qa-${randomUUID()}@example.com`,
      password = `QA-${randomUUID()}!`;
    const u = await check(
      db.auth.admin.createUser({ email, password, email_confirm: true }),
    );
    users.push({ id: u.user.id, email });
    await save();
    const client = createClient(
      url,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } },
    );
    users.at(-1).session = (
      await check(client.auth.signInWithPassword({ email, password }))
    ).session;
  }
  const [one, two, teacher, outsider] = users;
  await check(
    db
      .from("admin_users")
      .insert({
        email: teacher.email,
        name: "QA Instructor",
        role: "admin",
        site_id: "pacific-wave-digital",
        is_active: true,
      }),
  );
  for (let i = 0; i < 3; i++) {
    courses.push(
      await check(
        db
          .from("pwd_lms_courses")
          .insert({
            slug: `community-advanced-qa-${randomUUID()}`,
            title:
              i === 2
                ? "QA Private mentorship"
                : i === 1
                  ? "QA Other course"
                  : "QA Advanced community",
            kind: "live",
            amount: 100,
            currency: "VUV",
            published: false,
            private_sessions: i === 2,
          })
          .select()
          .single(),
      ),
    );
    await save();
  }
  const [course, other, mentor] = courses;
  const orderOne = await seedOrder(one, course, "QA Student 1");
  await seedOrder(two, course, "QA Student 2");
  await seedOrder(one, mentor, "QA Mentee 1");
  await seedOrder(two, mentor, "QA Mentee 2");
  const query = (channel, extra = "") =>
    `?course=${course.id}${channel ? "&channel=" + channel : ""}${extra}`;
  if (!process.env.COMMUNITY_UI_ONLY) {
    const list = await expect(api(one, null, query()));
    assert.equal(list.channels.length, 2);
    await expect(api(null, null, query()), 401);
    await expect(api(outsider, null, query()), 403);
    await expect(api(one, null, `?course=${other.id}`), 403);
    const lounge = list.channels.find((c) => !c.announcements),
      announcements = list.channels.find((c) => c.announcements);
    const feed = async (user = one, channel = lounge.id, extra = "") =>
      expect(api(user, null, query(channel, extra)));
    const action = (user, data, channel = lounge.id) =>
      api(user, { course: course.id, channel, ...data });
    const send = (user, body, extra = {}, channel = lounge.id) =>
      action(
        user,
        { action: "send", body, client_id: randomUUID(), ...extra },
        channel,
      );
    const roster = (await feed()).people;
    assert.ok(roster.some((p) => p.user_id === teacher.id));
    assert.ok(roster.every((p) => !("email" in p)));
    const cid = randomUUID(),
      greeting = `Hello @[Incorrect name](${two.id}), welcome to our project group.`;
    await expect(send(one, greeting, { client_id: cid }));
    await expect(send(one, greeting, { client_id: cid }));
    let data = await feed();
    assert.equal(data.messages.length, 1);
    const first = data.messages[0];
    assert.ok(first.body.includes("@[QA Student 2]"));
    let counts = await expect(api(two, null, query()));
    assert.equal(
      Number(counts.channels.find((c) => c.id === lounge.id).mentions),
      1,
    );
    await expect(send(one, `Hello @[Outsider](${outsider.id})`), 400);
    await expect(send(one, "Student announcement", {}, announcements.id), 403);
    await expect(
      send(teacher, "Welcome to the community", {}, announcements.id),
    );
    const announcement = (await feed(teacher, announcements.id)).messages[0];
    await expect(send(two, "Reply with next steps", { reply_to: first.id }));
    data = await feed(two, lounge.id, "&thread=" + first.id);
    assert.equal(data.messages.length, 2);
    assert.equal(data.messages[1].reply.id, first.id);
    await expect(
      send(one, "Wrong channel reply", { reply_to: announcement.id }),
      404,
    );
    await expect(
      action(two, { action: "edit", id: first.id, body: "Forged edit" }),
      403,
    );
    await expect(
      action(teacher, {
        action: "edit",
        id: first.id,
        body: "Instructor rewrite",
      }),
      403,
    );
    await expect(
      action(one, {
        action: "edit",
        id: first.id,
        body: `Updated launchplan @[QA Student 2](${two.id})`,
      }),
    );
    data = await feed(one, lounge.id, "&search=launchplan");
    assert.equal(data.messages.length, 1);
    assert.ok(data.messages[0].edited_at);
    for (let n = 0; n < 2; n++)
      await expect(
        action(two, {
          action: "react",
          id: first.id,
          emoji: "celebrate",
          active: true,
        }),
      );
    assert.equal((await feed()).messages[0].reactions[0].count, 1);
    await expect(
      action(two, { action: "pin", id: first.id, pinned: true }),
      403,
    );
    await expect(
      action(teacher, { action: "pin", id: first.id, pinned: true }),
    );
    assert.equal((await feed()).pinned.length, 1);
    await expect(
      action(two, {
        action: "report",
        id: first.id,
        reason: "QA report for instructor review",
      }),
    );
    assert.equal((await feed(two)).reports.length, 0);
    const report = (await feed(teacher)).reports[0];
    assert.ok(report);
    await expect(action(teacher, { action: "resolve", report_id: report.id }));
    assert.equal((await feed(teacher)).reports.length, 0);
    await expect(action(two, { action: "read", id: first.id }));
    counts = await expect(api(two, null, query()));
    assert.equal(
      Number(counts.channels.find((c) => c.id === lounge.id).mentions),
      0,
    );
    const group = await expect(
      action(teacher, {
        action: "create",
        name: "QA Private project team",
        description: "Private project planning",
        private: true,
        members: [one.id],
      }),
    );
    await expect(api(two, null, query(group.id)), 403);
    assert.ok(
      !(await expect(api(two, null, query()))).channels.some(
        (c) => c.id === group.id,
      ),
    );
    assert.ok(
      !(await feed(one, group.id)).people.some((p) => p.user_id === two.id),
    );
    await expect(send(one, `Tag @[Student 2](${two.id})`, {}, group.id), 400);
    async function upload(user, channel, name, bytes, type = "text/plain") {
      const r = await fetch(
        base +
          "/api/lms-community" +
          query(channel, "&action=upload&name=" + encodeURIComponent(name)),
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + user.session.access_token,
            "Content-Type": type,
          },
          body: bytes,
        },
      );
      return { status: r.status, data: await r.json() };
    }
    const file = (
      await expect(
        upload(
          one,
          group.id,
          "project-plan.txt",
          Buffer.from("Private QA project plan"),
        ),
      )
    ).file;
    const photo = (
      await expect(
        upload(
          one,
          group.id,
          "project.png",
          await sharp({
            create: {
              width: 24,
              height: 24,
              channels: 3,
              background: "#24406f",
            },
          })
            .png()
            .toBuffer(),
          "image/png",
        ),
      )
    ).file;
    assert.equal(photo.mime, "image/webp");
    await expect(send(two, "Stolen attachment", { files: [file.id] }), 400);
    await expect(
      send(one, "Wrong channel attachment", { files: [file.id] }),
      400,
    );
    await expect(
      send(
        one,
        "Private project documents",
        { files: [file.id, photo.id] },
        group.id,
      ),
    );
    const fileMessage = (await feed(one, group.id)).messages[0];
    const download = async (user) =>
      fetch(base + "/api/lms-community" + query(group.id, "&file=" + file.id), {
        headers: {
          Authorization: `Bearer ${user?.session?.access_token || ""}`,
        },
      });
    assert.equal((await download(one)).status, 200);
    assert.equal((await download(two)).status, 403);
    assert.equal((await download(null)).status, 401);
    await expect(
      action(teacher, { action: "members", members: [two.id] }, group.id),
    );
    assert.equal((await download(one)).status, 403);
    assert.equal((await download(two)).status, 200);
    await expect(
      action(teacher, { action: "delete", id: fileMessage.id }, group.id),
    );
    assert.equal((await download(two)).status, 404);
    const settings = {
      action: "settings",
      name: lounge.name,
      description: lounge.description,
      announcements: false,
      locked: true,
      archived: false,
    };
    await expect(action(teacher, settings));
    await expect(send(one, "Blocked by room lock"), 403);
    await expect(send(teacher, "Instructor can post in locked room"));
    await expect(action(teacher, { ...settings, archived: true }));
    await expect(send(teacher, "Archived rooms are read only"), 403);
    await expect(action(teacher, { ...settings, locked: false }));
    const mentorList = await expect(api(one, null, `?course=${mentor.id}`));
    assert.equal(mentorList.channels.length, 1);
    assert.ok(mentorList.private_course);
    const mentorTwo = await expect(api(two, null, `?course=${mentor.id}`));
    assert.notEqual(mentorList.channels[0].id, mentorTwo.channels[0].id);
    await expect(
      api(
        two,
        null,
        `?course=${mentor.id}&channel=${mentorList.channels[0].id}`,
      ),
      403,
    );
    assert.equal(
      (await expect(api(teacher, null, `?course=${mentor.id}`))).channels
        .length,
      2,
    );
    await expect(
      api(teacher, {
        action: "members",
        course: mentor.id,
        channel: mentorList.channels[0].id,
        members: [two.id],
      }),
      403,
    );
    console.log(
      "PASS API: tagging, unread counts, replies, edits, reactions, pins, search, reporting, uploads, access revocation, locks and isolated mentor conversations.",
    );
  }
  browser = await chromium.launch();
  async function pageFor(user, width = 1440) {
    const page = await browser.newPage({ viewport: { width, height: 1050 } });
    await page.addInitScript(
      ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
      { key: `sb-${ref}-auth-token`, session: user.session },
    );
    return page;
  }
  const adminPage = await pageFor(teacher);
  await adminPage.route("**/api/lms/admin", (route) =>
    route.fulfill({ json: { courses, lessons: [], orders: [], banks: [] } }),
  );
  await adminPage.goto(base + "/admin/training-center/community");
  await adminPage
    .getByLabel("Choose a course")
    .selectOption(course.id);
  await adminPage
    .getByRole("heading", { name: "Course conversations", exact: true })
    .waitFor();
  await adminPage
    .getByRole("button", { name: "Create group", exact: true })
    .click();
  await adminPage
    .getByLabel("Group name", { exact: true })
    .fill("UI project team");
  await adminPage
    .getByLabel("Description", { exact: true })
    .fill("Created using instructor controls");
  await adminPage.getByLabel("QA Student 1", { exact: true }).check();
  await adminPage
    .getByRole("button", { name: "Save conversation", exact: true })
    .click();
  await adminPage
    .getByRole("heading", { name: "UI project team", exact: true })
    .waitFor();
  await adminPage
    .getByLabel("Message UI project team", { exact: true })
    .fill("Welcome to your private team ");
  await adminPage
    .getByRole("button", { name: "Tag a student or instructor", exact: true })
    .click();
  await adminPage
    .getByRole("button", { name: "QA Student 1", exact: true })
    .click();
  await adminPage
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await adminPage.getByText("Message sent.", { exact: true }).waitFor();
  await adminPage
    .locator(".lms-community")
    .screenshot({ path: ".deployment/community-advanced-instructor.png" });
  await adminPage.close();
  for (const width of [1440, 390]) {
    const page = await pageFor(one, width);
    await page.route("**/api/lms/dashboard", (route) =>
      route.fulfill({ json: { orders: [orderOne], progress: [] } }),
    );
    await page.goto(`${base}/training-center/course/${course.id}`);
    await page
      .getByRole("button", { name: "Community & groups", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Course conversations", exact: true })
      .waitFor();
    await page
      .getByLabel("Message Course lounge", { exact: true })
      .fill(`Student UI message at ${width}px`);
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await page
      .getByText(`Student UI message at ${width}px`, { exact: true })
      .waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page
      .locator(".lms-community")
      .screenshot({ path: `.deployment/community-advanced-${width}.png` });
    await page.close();
  }
  await sql(
    `BEGIN;UPDATE pwd_lms_orders SET status='refunded' WHERE id=${literal(orderOne.id)};DELETE FROM pwd_lms_emails WHERE order_id=${literal(orderOne.id)};COMMIT;`,
  );
  await expect(api(one, null, query()), 403);
  const mentorPage = await pageFor(one, 390);
  await mentorPage.route("**/api/lms/dashboard", (route) =>
    route.fulfill({
      json: {
        orders: orders.filter((o) => o.user_id === one.id),
        progress: [],
      },
    }),
  );
  await mentorPage.goto(`${base}/training-center/course/${mentor.id}`);
  await mentorPage
    .getByRole("button", { name: "Private mentor chat", exact: true })
    .click();
  await mentorPage
    .getByRole("heading", { name: "Mentorship · QA Mentee 1", exact: true })
    .waitFor();
  assert.equal(
    await mentorPage.getByText("QA Mentee 2", { exact: false }).count(),
    0,
  );
  assert.ok(
    await mentorPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await mentorPage
    .locator(".lms-community")
    .screenshot({ path: ".deployment/community-advanced-mentorship.png" });
  await mentorPage.close();
  console.log(
    "PASS browser: dedicated admin communication route, private group creation, instructor @mention/send, student desktop/mobile sends, no horizontal overflow.",
  );
} catch (error) {
  if (browser)
    for (const [i, page] of browser
      .contexts()
      .flatMap((c) => c.pages())
      .entries()) {
      await page
        .screenshot({
          path: `.deployment/community-failure-${i}.png`,
          fullPage: true,
        })
        .catch(() => {});
      console.log(
        "Browser failure page",
        page.url(),
        (await page.locator("body").innerText()).slice(0, 1200),
      );
    }
  throw error;
} finally {
  if (browser) await browser.close();
  for (const c of courses) {
    const channels = await check(
      db.from("pwd_lms_channels").select("id").eq("course_id", c.id),
    );
    if (channels.length) {
      const files = await check(
        db
          .from("pwd_lms_chat_files")
          .select("path")
          .in(
            "channel_id",
            channels.map((ch) => ch.id),
          ),
      );
      if (files.length)
        await check(
          db.storage
            .from("pwd-community-files")
            .remove(files.map((f) => f.path)),
        );
    }
    await check(db.from("pwd_lms_channels").delete().eq("course_id", c.id));
    await check(db.from("pwd_lms_lessons").delete().eq("course_id", c.id));
    await check(db.from("pwd_lms_orders").delete().eq("course_id", c.id));
    await check(db.from("pwd_lms_courses").delete().eq("id", c.id));
  }
  for (const u of users) {
    await check(db.from("admin_users").delete().eq("email", u.email));
    await check(db.auth.admin.deleteUser(u.id));
  }
  await unlink(manifest).catch(() => {});
  console.log(
    "Removed all synthetic fixtures and uploads. No chat/email was sent to real students.",
  );
}
