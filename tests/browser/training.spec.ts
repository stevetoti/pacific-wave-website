import { test, expect } from "@playwright/test";
test("October campaign keeps confirmed details and leads into LMS checkout", async ({
  page,
}) => {
  await page.goto("/vanuatu-training");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Build Your Online Business in 30 Days",
  );
  await expect(page.getByText("3 MONTHS FREE", { exact: true })).toBeVisible();
  expect(await page.locator("time").count()).toBe(12);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://pacificwavedigital.com/vanuatu-training",
  );
  await page
    .getByRole("link", { name: "Register & continue to checkout" })
    .click();
  await expect(page).toHaveURL(
    /training-center\/checkout\?course=vanuatu-october-2026/,
  );
  await expect(
    page.getByRole("heading", { name: "Start with your student account" }),
  ).toBeVisible({ timeout: 15000 });
});
test("private training APIs reject anonymous list export status and retry", async ({
  request,
}) => {
  for (const suffix of ["", "?format=csv"])
    expect((await request.get("/api/admin/training" + suffix)).status()).toBe(
      401,
    );
  for (const method of ["patch", "post"] as const)
    expect(
      (
        await request[method](
          "/api/admin/training/00000000-0000-4000-8000-000000000001",
          { data: { status: "enrolled" } },
        )
      ).status(),
    ).toBe(401);
  expect(
    (
      await request.patch("/api/admin/training/cohort", {
        data: { registrationState: "closed" },
      })
    ).status(),
  ).toBe(401);
});
// Explicit opt-in integration test. Uses a temporary admin and synthetic registrations,
// sandbox-only training mail, and removes exactly the records it creates.
