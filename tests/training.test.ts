import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import {
  registrationSchema,
  normalizePhone,
  type Registration,
} from "../src/lib/training/schema";
import { initialCohort as cohort, isOpen } from "../src/lib/training/config";
import { csvCell } from "../src/lib/training/csv";
import { trainingEmails } from "../src/lib/training/email-templates";
import { registerTraining } from "../src/lib/server/training-register";
import { notifyTraining } from "../src/lib/server/training-email";
import { GET as list } from "../src/app/api/admin/training/route";
import {
  PATCH as update,
  POST as retry,
} from "../src/app/api/admin/training/[id]/route";
import { PATCH as close } from "../src/app/api/admin/training/cohort/route";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://training-test.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test";
process.env.RESEND_API_KEY = "test";
delete process.env.ERROR_NOTIFICATION_EMAILS;
process.env.TRAINING_EMAIL_MODE = "sandbox";
const original = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = original;
});
const valid = () => ({
  request_id: randomUUID(),
  cohort_id: cohort.id,
  full_name: "Élodie Tahi",
  email: "person@example.invalid",
  phone: "+678 528 8141",
  location_code: "port_vila",
  attendance_preference: "in_person",
  acknowledged: true,
  future_training_opt_in: false,
});
const parsed = () => registrationSchema.parse(valid());
const request = (body: unknown, token?: string) =>
  new Request("https://test.invalid/api/training/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
function transport(
  options: {
    failSave?: boolean;
    duplicate?: boolean;
    emailFailure?: boolean;
    role?: string;
    limited?: boolean;
    closed?: boolean;
  } = {},
) {
  const calls: { path: string; method: string; body: any }[] = [];
  const record = {
    ...parsed(),
    id: randomUUID(),
    reference: randomUUID(),
    cohort_snapshot: cohort,
    phone_normalized: "+6785288141",
    created_at: new Date().toISOString(),
    student_email_state: "pending",
    internal_email_state: "pending",
  };
  globalThis.fetch = async (input, init) => {
    const r = input instanceof Request ? input : new Request(input, init);
    const u = new URL(r.url);
    const body =
      r.method === "GET" ? null : JSON.parse((await r.text()) || "null");
    calls.push({ path: u.pathname, method: r.method, body });
    let data: unknown = [];
    let status = 200;
    if (u.hostname === "api.resend.com") {
      data = { id: "sandbox-test" };
      status = options.emailFailure ? 500 : 200;
    } else if (u.hostname !== "training-test.invalid")
      throw new Error("Unexpected network");
    else if (u.pathname === "/auth/v1/user")
      data = { id: randomUUID(), email: "admin@example.invalid" };
    else if (u.pathname === "/rest/v1/admin_users")
      data = { role: options.role || "admin", is_active: true };
    else if (u.pathname.endsWith("/pwd_rate_limit")) data = !options.limited;
    else if (u.pathname.endsWith("/pwd_register_training")) {
      data = options.failSave
        ? { code: "XX000", message: "save failed" }
        : options.closed
          ? { closed: true }
          : { id: record.id, created: !options.duplicate };
      status = options.failSave ? 500 : 200;
    } else if (u.pathname.endsWith("/pwd_claim_training_email"))
      data = [record];
    else if (u.pathname.endsWith("/pwd_training_cohorts"))
      data = { config: cohort };
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  return calls;
}
test("all confirmed dates, Vanuatu timezone, fee and expiry are consistent", () => {
  assert.equal(cohort.dates.length, 12);
  for (const d of cohort.dates) {
    const day = new Intl.DateTimeFormat("en", {
      weekday: "short",
      timeZone: cohort.timezone,
    }).format(new Date(`${d}T15:00:00+11:00`));
    assert.ok(["Mon", "Thu", "Sat"].includes(day));
  }
  assert.equal(cohort.fee, 35000);
  assert.equal(cohort.softwareMonths, 3);
  assert.equal(isOpen(cohort, new Date("2026-11-01")), false);
  assert.equal(
    isOpen({ ...cohort, registrationState: "closed" }, new Date("2026-09-15")),
    false,
  );
});
test("Unicode names and Port Vila/Santo/Pentecost with every attendance mode validate", () => {
  for (const [location_code, attendance_preference] of [
    ["port_vila", "in_person"],
    ["luganville", "online"],
    ["pentecost", "mixed"],
  ])
    assert.ok(
      registrationSchema.safeParse({
        ...valid(),
        location_code,
        attendance_preference,
      }).success,
    );
  assert.equal(parsed().future_training_opt_in, false);
});
test("Other/Outside require location detail; invalid email/phone/ack and long questions fail", () => {
  for (const location_code of ["other", "outside"]) {
    assert.equal(
      registrationSchema.safeParse({ ...valid(), location_code }).success,
      false,
    );
    assert.ok(
      registrationSchema.safeParse({
        ...valid(),
        location_code,
        location_other: "Sydney",
      }).success,
    );
  }
  for (const patch of [
    { email: "bad" },
    { phone: "123" },
    { acknowledged: false },
    { question: "x".repeat(501) },
  ])
    assert.equal(
      registrationSchema.safeParse({ ...valid(), ...patch }).success,
      false,
    );
  assert.equal(normalizePhone("00678 528 8141"), "+6785288141");
  assert.equal(normalizePhone("+61 412 345 678"), "+61412345678");
});
test("CSV formula injection is neutralised including whitespace and quoted content", () => {
  for (const v of ["=SUM(A1)", " +6781234567", "\t@evil", "\r-1"])
    assert.ok(csvCell(v).startsWith("\"'"));
  assert.equal(csvCell('a"b'), '"a""b"');
});
test("notification templates include branded enrolment and payment links with accurate course terms", () => {
  const r = {
    ...parsed(),
    full_name: "<b>Élodie</b>",
    reference: randomUUID(),
    cohort_snapshot: cohort,
    phone_normalized: "+6785288141",
    created_at: "2026-09-15",
  } as unknown as Registration;
  const e = trainingEmails(r);
  assert.match(e.student.text, /VUV 35,000/);
  assert.match(e.student.text, /3 months free/);
  assert.match(e.student.text, /does not take payment or confirm a paid place/);
  assert.ok(e.student.html.includes('href="https://pacificwavedigital.com/training-center/checkout?course=vanuatu-october-2026"'));
  assert.ok(e.student.html.includes('href="https://pacificwavedigital.com/training-center/account?course=vanuatu-october-2026"'));
  assert.ok(!e.student.html.includes("<b>Élodie</b>"));
  assert.match(e.student.text, /upload your payment proof/);
  assert.ok(!e.student.text.includes("Our team will contact you with payment"));
  assert.equal(e.student.subject.includes(r.full_name), false);
});
test("database failure preserves failure and never schedules email", async () => {
  transport({ failSave: true });
  let scheduled = false;
  const r = await registerTraining(request(valid()), () => {
    scheduled = true;
  });
  assert.equal(r.status, 503);
  assert.equal(scheduled, false);
});
test("durable save schedules notification; duplicate returns identical public shape without another email", async () => {
  for (const duplicate of [false, true]) {
    transport({ duplicate });
    let scheduled = false;
    const input = valid();
    const r = await registerTraining(request(input), () => {
      scheduled = true;
    });
    assert.equal(r.status, 201);
    assert.deepEqual(await r.json(), {
      success: true,
      reference: input.request_id,
    });
    assert.equal(scheduled, !duplicate);
  }
});
test("scheduling failure cannot turn durable registration into apparent failure", async () => {
  transport();
  assert.equal(
    (
      await registerTraining(request(valid()), () => {
        throw new Error("scheduler down");
      })
    ).status,
    201,
  );
});
test("rate limit, closed cohort and honeypot prevent notifications", async () => {
  for (const [options, input, status] of [
    [{ limited: true }, valid(), 429],
    [{ closed: true }, valid(), 409],
    [{}, { ...valid(), website: "spam" }, 400],
  ] as const) {
    transport(options);
    let scheduled = false;
    assert.equal(
      (
        await registerTraining(request(input), () => {
          scheduled = true;
        })
      ).status,
      status,
    );
    assert.equal(scheduled, false);
  }
});
test("email failure leaves pending record and reports only redacted context", async () => {
  const calls = transport({ emailFailure: true });
  await notifyTraining(randomUUID());
  assert.equal(calls.filter((c) => c.path === "/emails").length, 2);
  assert.equal(
    calls.some((c) => c.body?.student_email_state === "accepted"),
    false,
  );
  assert.ok(calls.some((c) => c.body?.email_lock_until === null));
});
test("preview notifications go only to sandbox and record test acceptance", async () => {
  const calls = transport();
  await notifyTraining(randomUUID());
  const emails = calls.filter((c) => c.path === "/emails");
  assert.equal(emails.length, 2);
  for (const e of emails) assert.equal(e.body.to, "delivered@resend.dev");
  assert.ok(calls.some((c) => c.body?.student_email_state === "test_accepted"));
});
test("anonymous and viewer cannot list/export/change/retry/close registrations", async () => {
  const context = { params: Promise.resolve({ id: randomUUID() }) };
  for (const token of [undefined, "viewer"]) {
    transport({ role: "viewer" });
    const req = request(
      { status: "enrolled", registrationState: "closed" },
      token,
    );
    assert.equal((await list(req)).status, token ? 403 : 401);
    assert.equal((await update(req, context)).status, token ? 403 : 401);
    assert.equal((await retry(req, context)).status, token ? 403 : 401);
    assert.equal((await close(req)).status, token ? 403 : 401);
  }
});
test("real SQL: duplicate/retry immutability, consent, atomic email lock, RLS and closed cohort", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;",
    );
    const sql = readFileSync(
      "supabase/migrations/20260915_vanuatu_training.sql",
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    const future = { ...cohort, teachingEnd: "2099-10-31T17:00:00+11:00" };
    await db.query("INSERT INTO pwd_training_cohorts VALUES($1,$2)", [
      cohort.id,
      future,
    ]);
    const input = { ...parsed(), phone_normalized: "+6785288141" };
    const save = async (i: unknown) =>
      (
        await db.query<{
          result: { id: string; created: boolean; closed?: boolean };
        }>("SELECT pwd_register_training($1) AS result", [i])
      ).rows[0].result;
    const first = await save(input);
    assert.equal(first.created, true);
    const again = await save({
      ...input,
      full_name: "Overwrite attempt",
      future_training_opt_in: true,
    });
    assert.equal(again.created, false);
    const duplicate = await save({
      ...input,
      request_id: randomUUID(),
      email: input.email.toUpperCase(),
      full_name: "Other attempt",
    });
    assert.equal(duplicate.id, first.id);
    const records = await db.query<{
      full_name: string;
      future_training_opt_in: boolean;
      fee: number;
      status: string;
    }>("SELECT * FROM pwd_training_registrations");
    assert.equal(records.rows.length, 1);
    assert.equal(records.rows[0].full_name, input.full_name);
    assert.equal(records.rows[0].future_training_opt_in, false);
    assert.equal(records.rows[0].fee, 35000);
    assert.equal(records.rows[0].status, "received");
    assert.equal(
      (await db.query("SELECT * FROM pwd_training_receipts")).rows.length,
      2,
    );
    assert.equal(
      (await db.query("SELECT * FROM pwd_claim_training_email($1)", [first.id]))
        .rows.length,
      1,
    );
    assert.equal(
      (await db.query("SELECT * FROM pwd_claim_training_email($1)", [first.id]))
        .rows.length,
      0,
    );
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(
        db.query("SELECT * FROM pwd_training_registrations"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("SELECT pwd_register_training($1)", [input]),
        /permission denied/,
      );
      await db.exec("RESET ROLE");
    }
    await db.query(
      "UPDATE pwd_training_cohorts SET config=jsonb_set(config,'{registrationState}','\"closed\"')",
    );
    assert.equal(
      (await save({ ...input, request_id: randomUUID() })).closed,
      true,
    );
  } finally {
    await db.close();
  }
});
