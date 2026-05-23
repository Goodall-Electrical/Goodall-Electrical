import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", title: /Goodall Electrical/ },
  { path: "/services", title: /Services/ },
  { path: "/services/electrical", title: /Electrical/ },
  { path: "/services/audio-visual", title: /Audio Visual/ },
  { path: "/projects", title: /Projects/ },
  { path: "/projects/sale-greyhound-av", title: /Sale Greyhound/ },
  { path: "/about", title: /About/ },
  { path: "/testimonials", title: /Testimonials/ },
  { path: "/contact", title: /Contact/ },
  { path: "/quote", title: /quote/i },
];

for (const p of pages) {
  test(`renders ${p.path}`, async ({ page }) => {
    const res = await page.goto(p.path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(p.title);
    await expect(page.locator("header a", { hasText: "GOODALL" })).toBeVisible();
    await expect(page.locator("footer")).toContainText("ACN 684 711 224");
  });
}
