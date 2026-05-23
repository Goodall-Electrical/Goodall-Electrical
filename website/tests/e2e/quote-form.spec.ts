import { test, expect } from "@playwright/test";

test("quote form has all required fields and accepts focus", async ({ page }) => {
  await page.goto("/quote");
  for (const name of ["name", "email", "phone", "siteAddress", "description"]) {
    const field = page.locator(`[name="${name}"]`);
    await expect(field).toBeVisible();
    await field.focus();
  }
  await expect(page.locator('input[name="jobType"][value="electrical"]')).toBeAttached();
  await expect(page.locator('input[name="siteType"][value="hospitality"]')).toBeAttached();
  await expect(page.locator('input[name="urgency"][value="emergency"]')).toBeAttached();
  await expect(page.locator('input[name="_hp"]')).toBeHidden();
});

test("quote thank-you state renders on ?status=ok", async ({ page }) => {
  await page.goto("/quote?status=ok");
  await expect(page.getByText("Thanks — we've got your request.")).toBeVisible();
});
