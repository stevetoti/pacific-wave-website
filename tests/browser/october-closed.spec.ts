import { test, expect } from "@playwright/test";
import { octoberCourseId, octoberCourseSlug } from "../../src/lib/lms/cohort-registration";
test("October offers stay removed after reload and old registration links lead to November", async ({page, request}) => {
  for (const key of [octoberCourseSlug, octoberCourseId]) {
    await page.goto(`/training-center/account?mode=signup&course=${key}`);
    await expect(page).toHaveURL(/course=vanuatu-november-2026/);
    await expect(page.locator(".lms-notice")).toContainText("Build Your Business in 30 Days with AI");
    const checkout = await request.get(`/training-center/checkout?course=${key}`, {maxRedirects: 0});
    expect(checkout.status()).toBe(307);
    expect(checkout.headers().location).toContain("course=vanuatu-november-2026");
  }
  await page.goto(`/training-center/programs/${octoberCourseSlug}`);
  await expect(page).toHaveURL(/vanuatu-training$/);
  await page.goto("/training-center");
  await page.reload();
  await expect(page.locator(".lms-catalog-grid article")).toHaveCount(4);
  await expect(page.getByRole("heading", {name:"Build Your Online Business in 30 Days",exact:true})).toHaveCount(0);
  const catalog=await (await request.get("/api/lms/catalog")).json();
  expect(catalog.courses.some((c:{slug:string})=>c.slug===octoberCourseSlug)).toBe(false);
  expect(catalog.courses.find((c:{slug:string})=>c.slug==="vanuatu-november-2026").enrollment_open).toBe(true);
  const share=await request.get(`/go/INVALIDCODE?to=/training-center/programs/${octoberCourseSlug}`, {headers:{"User-Agent":"WhatsApp"},maxRedirects:0});
  expect(share.status()).toBe(200);
  expect(await share.text()).toContain("Build Your Business in 30 Days with AI");
  const human=await request.get(`/go/INVALIDCODE?to=/training-center/programs/${octoberCourseSlug}`, {headers:{"User-Agent":"Mozilla/5.0"},maxRedirects:0});
  expect(human.status()).toBe(307);
  expect(human.headers().location).toContain("/vanuatu-training");
});
