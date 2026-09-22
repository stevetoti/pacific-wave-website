import { test, expect as baseExpect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
const expect = baseExpect.configure({ timeout: 20000 });
test("training centre catalogue, October checkout and student entry work on all screen sizes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/training-center");
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Build Your Online Business in 30 Days",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({path:`/tmp/lms-catalog-${test.info().project.name}.png`,fullPage:true});
  await page.locator("article").filter({hasText:"Build Your Online Business in 30 Days"}).getByRole("link", { name: "Register", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create your student account" })).toBeVisible();
  await expect(page.getByLabel("Phone / WhatsApp")).toBeVisible();
  await expect(page.getByLabel("Location (town, island or country)")).toBeVisible();
  await expect(page.getByLabel("How would you like to attend?")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "minlength",
    "10",
  );
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `/tmp/lms-account-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("LMS rejects anonymous private data, invalid payment proofs and forged payment webhooks", async ({
  request,
}) => {
  for (const action of ["dashboard", "admin", "course?id=" + randomUUID()])
    expect((await request.get("/api/lms/" + action)).status()).toBe(401);
  expect(
    (
      await request.post("/api/lms/stripe-webhook", { data: "forged" })
    ).status(),
  ).toBeGreaterThanOrEqual(400);
});
test("real synthetic student registration, private dashboard, admin lesson editing and quiz progression", async ({
  page,
  request,
}) => {
  test.skip(
    test.info().project.name !== "desktop" ||
      process.env.TRAINING_LIVE_TESTS !== "1",
  );
  test.setTimeout(180000);
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const suffix = randomUUID();
  const email = `lms-test-${suffix}@example.com`;
  const password = `Lms-${randomUUID()}!`;
  let uid: string | undefined,
    cid: string | undefined,
    adminId: string | undefined,
    orderId: string | undefined,
    proofPath: string | undefined,
    originalBanks: unknown[] | undefined;
  const adminEmail = `lms-admin-${suffix}@example.com`;
  async function checked<T>(p: PromiseLike<{ data: T; error: unknown }>) {
    const r = await p;
    if (r.error) throw r.error;
    return r.data!;
  }
  try {
    const created = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error) throw created.error;
    uid = created.data.user.id;
    const other = await db.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });
    if (other.error) throw other.error;
    adminId = other.data.user.id;
    await checked(
      db
        .from("admin_users")
        .insert({
          email: adminEmail,
          name: "LMS synthetic admin",
          role: "admin",
          site_id: "pacific-wave-digital",
          is_active: true,
        }),
    );
    const course = await checked(
      db
        .from("pwd_lms_courses")
        .insert({
          slug: `test-${suffix}`,
          title: "LMS synthetic course",
          description: "Temporary automated test",
          introduction: "Welcome synthetic student",
          kind: "recorded",
          amount: 35000,
          currency: "VUV",
          published: true,
        })
        .select()
        .single(),
    );
    cid = course.id;
    const lesson = await checked(
      db
        .from("pwd_lms_lessons")
        .insert({
          course_id: cid,
          title: "Private test lesson",
          position: 1,
          published: true,
          content: "PRIVATE LESSON CONTENT",
          quiz: [
            {
              question: "Choose the correct answer",
              options: ["Incorrect", "Correct"],
              answer: 1,
            },
          ],
        })
        .select()
        .single(),
    );
    await page.goto(`/training-center/account?course=${cid}`);
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Your registration details" }),
    ).toBeVisible({ timeout: 20000 });
    await page
      .getByLabel("Full name", { exact: true })
      .fill("LMS synthetic student");
    await page.getByLabel("Phone / WhatsApp").fill("+678 5555555");
    await page.getByRole("checkbox", { name: /I understand/ }).check();
    await page
      .getByRole("button", { name: "Save registration & continue" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Choose how to pay" }),
    ).toBeVisible();
    const order = await checked(
      db
        .from("pwd_lms_orders")
        .select("*")
        .eq("user_id", uid)
        .eq("course_id", cid)
        .single(),
    );
    orderId = order.id;
    expect(order.amount).toBe(35000);
    expect(order.status).toBe("pending");

    const studentClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const session = await studentClient.auth.signInWithPassword({
      email,
      password,
    });
    const headers = {
      Authorization: `Bearer ${session.data.session!.access_token}`,
    };
    const locked = await request.get(`/api/lms/course?id=${cid}`, { headers });
    const lockedData = await locked.json();
    expect(lockedData.lessons[0].content).toBe("");
    expect(lockedData.lessons[0].quiz).toEqual([]);
    expect(
      (
        await request.post("/api/lms/progress", {
          headers,
          data: { lesson_id: lesson.id, answers: [1] },
        })
      ).status(),
    ).toBe(403);
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const adminSession = await adminClient.auth.signInWithPassword({
      email: adminEmail,
      password,
    });
    const adminHeaders = {
      Authorization: `Bearer ${adminSession.data.session!.access_token}`,
    };
    expect(
      (
        await request.get(`/api/lms/course?id=${cid}`, {
          headers: adminHeaders,
        })
      ).status(),
    ).toBe(403);
    originalBanks = (
      await checked(
        db.from("pwd_lms_settings").select("value").eq("id", "banks").single(),
      )
    ).value;
    await checked(
      db
        .from("pwd_lms_settings")
        .update({
          value: [
            {
              bank: "ANZ",
              account_name: "SYNTHETIC TEST — DO NOT PAY",
              account_number: "TEST-ONLY",
              branch: "Automated test",
              currency: "VUV",
            },
          ],
        })
        .eq("id", "banks"),
    );
    try {
      await page.reload();
      await page.getByLabel("Choose your bank").selectOption("ANZ");
      await page
        .getByLabel("Upload payment proof")
        .setInputFiles({
          name: "synthetic-proof.png",
          mimeType: "image/png",
          buffer: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYe0AAAAASUVORK5CYII=",
            "base64",
          ),
        });
      await page
        .getByRole("button", { name: "Submit proof & open dashboard" })
        .click();
      await expect(
        page.getByRole("heading", { name: "Welcome to your course" }),
      ).toBeVisible({ timeout: 20000 });
    } finally {
      await checked(
        db
          .from("pwd_lms_settings")
          .update({ value: originalBanks })
          .eq("id", "banks"),
      );
      originalBanks = undefined;
    }
    const submitted = await checked(
      db
        .from("pwd_lms_orders")
        .select("proof_path,status")
        .eq("id", order.id)
        .single(),
    );
    proofPath = submitted.proof_path;
    expect(submitted.status).toBe("review");
    expect(proofPath).toBeTruthy();
    const anonymous = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const denied = await anonymous.storage
      .from("pwd-training-proofs")
      .download(proofPath!);
    expect(denied.error).toBeTruthy();
    await checked(
      db.from("pwd_lms_courses").update({ published: false }).eq("id", cid),
    );
    const approved = await request.post("/api/lms/admin", {
      headers: adminHeaders,
      data: {
        action: "review",
        id: order.id,
        status: "paid",
        note: "Synthetic verification",
      },
    });
    if (approved.status() !== 200) {
      const state = await db
        .from("pwd_lms_orders")
        .select("status")
        .eq("id", order.id)
        .single();
      console.log(
        "Review response",
        await approved.json(),
        "persisted status",
        state.data?.status,
      );
    }
    expect(approved.status()).toBe(200);
    const unlocked = await request.get(`/api/lms/course?id=${cid}`, {
      headers,
    });
    const unlockedData = await unlocked.json();
    expect(unlockedData.lessons[0].content).toBe("PRIVATE LESSON CONTENT");
    expect(unlockedData.lessons[0].quiz[0].answer).toBeUndefined();
    await page.goto(`/training-center/course/${cid}`);
    await expect(
      page.getByRole("heading", { name: "Welcome to your course" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Private test lesson/ }).click();
    await page.getByRole("radio", { name: "Incorrect", exact: true }).check();
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "0%" }),
    ).toBeVisible();
    await page.getByRole("radio", { name: "Correct", exact: true }).check();
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByText("Lesson complete — well done!")).toBeVisible();
    expect(
      (
        await checked(
          db.from("pwd_lms_progress").select("*").eq("user_id", uid),
        )
      ).length,
    ).toBe(1);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.goto("/training-center/account");
    await page.getByLabel("Email address", { exact: true }).fill(adminEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto("/admin/training-center");
    await page.getByRole("button", { name: "Lessons", exact: true }).click();
    await page.getByLabel("Choose a course").selectOption(cid!);
    await page.getByRole("button", { name: /Private test lesson/ }).click();
    await page
      .getByLabel("Introduction / lesson notes")
      .fill("UPDATED PRIVATE LESSON");
    await page
      .getByRole("button", { name: "Save lesson", exact: true })
      .click();
    await expect(page.getByText("Saved successfully.")).toBeVisible();
    expect(
      (
        await checked(
          db
            .from("pwd_lms_lessons")
            .select("content")
            .eq("id", lesson.id)
            .single(),
        )
      ).content,
    ).toBe("UPDATED PRIVATE LESSON");
    await expect.poll(async()=>{const rows=await checked(db.from('pwd_lms_emails').select('state').eq('order_id',orderId!));return rows.some(r=>r.state==='test_accepted');},{timeout:30000}).toBe(true);
    await page.screenshot({ path: "/tmp/lms-admin.png", fullPage: true });
  } finally {
    if (originalBanks)
      await db
        .from("pwd_lms_settings")
        .update({ value: originalBanks })
        .eq("id", "banks");
    if (proofPath)
      await db.storage.from("pwd-training-proofs").remove([proofPath]);
    if (uid) await db.from("pwd_lms_progress").delete().eq("user_id", uid);
    if (uid) await db.from("pwd_lms_orders").delete().eq("user_id", uid);
    if (cid) {
      await db.from("pwd_lms_lessons").delete().eq("course_id", cid);
      await db.from("pwd_lms_courses").delete().eq("id", cid);
    }
    if (adminId) {
      await db.from("pwd_lms_audit").delete().eq("actor_id", adminId);
      await db.from("admin_users").delete().eq("email", adminEmail);
      await db.auth.admin.deleteUser(adminId);
    }
    if (uid) await db.auth.admin.deleteUser(uid);
  }
});

test('three image courses and public mentorship details lead to the correct checkout', async ({page}) => {
 await page.goto('/training-center');
 const cards=page.locator('.lms-catalog-grid article');
 await expect(cards).toHaveCount(3);
 for(const card of await cards.all()) await expect(card.locator('.lms-card-art img')).toBeVisible();
 const mentor=cards.filter({hasText:'One on One Mentorship Program'});
 await expect(mentor).toContainText('250,000');
 await mentor.getByRole('link',{name:'View course'}).click();
 await expect(page.getByRole('heading',{name:'One on One Mentorship Program',exact:true})).toBeVisible();
 await expect(page.getByText('Total fee for all 3 months')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('link',{name:'Enrol now'}).first().click();
 await expect(page).toHaveURL(/account\?mode=signup&course=one-on-one-mentorship/);
 await expect(page.getByRole('heading',{name:'Create your student account'})).toBeVisible();
 await expect(page.locator('.lms-notice')).toContainText('250,000');
 await page.goto('/training-center/programs/how-to-start-a-profitable-business');
 await expect(page.getByRole('heading',{name:'How To Start A Profitable Business',exact:true})).toBeVisible();
 await expect(page.getByText('Not yet open for enrolment')).toBeVisible();
 await expect(page.getByRole('link',{name:'Enrol now'})).toHaveCount(0);
 await page.goto('/training-center/checkout?course=how-to-start-a-profitable-business');
 await expect(page.getByRole('heading',{name:'Course unavailable'})).toBeVisible();
});
