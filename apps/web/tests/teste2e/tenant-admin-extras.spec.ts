import { expect, test } from "./fixtures";

test.describe("Tenant Admin Extras", () => {
  test("webhooks page is accessible", async ({ page }) => {
    await page.goto("/admin/webhooks");

    await expect(page.locator("main")).toContainText(/webhook/i);
  });

  test("API keys page is accessible", async ({ page }) => {
    await page.goto("/admin/api");

    await expect(page.locator("main")).toContainText(/API|clé/i);
  });

  test("tenant audit log page is accessible", async ({ page }) => {
    await page.goto("/admin/audit-log");

    await expect(page.locator("main")).toContainText(/action|journal/i);
  });

  test("roadmap config page is accessible", async ({ page }) => {
    await page.goto("/admin/roadmap");

    await expect(page.locator("main")).toContainText(/roadmap/i);
  });
});
