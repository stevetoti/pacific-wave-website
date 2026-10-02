import test from "node:test";
import assert from "node:assert/strict";
import { contactTemplates, fillTemplate, normalizePhone, smsParts } from "../src/lib/lms/contact-templates";

test("outreach templates personalise, count SMS parts and normalise Vanuatu numbers", () => {
  const vars = { first_name: "Mary", course: "Build Your Online Business in 30 Days", amount: "VUV 35,000", reference: "PWD-1A2B3C4D", link: "pacificwavedigital.com/training-center" };
  const reminder = contactTemplates.find((t) => t.id === "payment_reminder")!;
  const sms = fillTemplate(reminder.sms, vars);
  assert.ok(sms.startsWith("Hi Mary,"));
  assert.ok(sms.includes("VUV 35,000") && sms.includes("PWD-1A2B3C4D"));
  assert.ok(!/\{[a-z_]+\}/.test(fillTemplate(reminder.email, vars)), "no placeholders left");
  assert.equal(smsParts("x".repeat(160)), 1);
  assert.equal(smsParts("x".repeat(161)), 2);
  assert.equal(smsParts("x".repeat(307)), 3);
  assert.equal(normalizePhone("5288141"), "+6785288141");
  assert.equal(normalizePhone("+678 528 8141"), "+6785288141");
  assert.equal(normalizePhone("678 5288141"), "+6785288141");
  assert.equal(normalizePhone("+233 24 067 5759"), "+233240675759");
  assert.equal(normalizePhone("123"), "");
});
