import test from "node:test";
import assert from "node:assert/strict";
import { replacementRegistration, octoberCourseId, octoberCourseSlug } from "../src/lib/lms/cohort-registration";
import { safeDestination } from "../src/lib/server/affiliates";
test("completed October public enrolment links move to November while student access remains intact", () => {
  for (const key of [octoberCourseId, octoberCourseSlug]) {
    assert.equal(replacementRegistration(["account"], key, "signup"), "/training-center/account?course=vanuatu-november-2026&mode=signup");
    assert.equal(replacementRegistration(["checkout"], key), "/training-center/checkout?course=vanuatu-november-2026");
    assert.equal(replacementRegistration(["course", key], key), null);
    assert.equal(replacementRegistration(["dashboard"], key), null);
    assert.equal(replacementRegistration(["account"], key, "reset"), null);
    assert.equal(replacementRegistration(["account"], key, undefined, "token"), null);
  }
  assert.equal(replacementRegistration(["programs", octoberCourseSlug]), "/vanuatu-training");
  assert.equal(safeDestination(`/training-center/programs/${octoberCourseSlug}`), "/vanuatu-training");
  assert.equal(replacementRegistration(["account"], "vanuatu-november-2026", "signup"), null);
  assert.equal(replacementRegistration(["account"], "one-on-one-mentorship", "signup"), null);
});
