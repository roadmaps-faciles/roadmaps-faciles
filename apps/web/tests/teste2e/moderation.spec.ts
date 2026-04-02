import { expect, test } from "./fixtures";

test.describe("Moderation", () => {
  test("shows pending posts in moderation queue", async ({ page }) => {
    await page.goto("/moderation");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/attente|pending/i);
    await expect(page.getByRole("cell", { name: "Pending Post" }).first()).toBeVisible();
  });

  test("approve button is visible for pending post", async ({ page }) => {
    await page.goto("/moderation");

    const approveButton = page.getByRole("button", { name: /approuver|approve/i });
    await expect(approveButton.first()).toBeVisible();
  });

  test("rejected posts page is accessible", async ({ page }) => {
    await page.goto("/moderation/rejected");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/rejeté|rejected/i);
  });

  test("moderation link is visible in navigation", async ({ page }) => {
    await page.goto("/moderation");

    const sideNavLink = page.getByRole("link", { name: /attente|pending/i });
    await expect(sideNavLink.first()).toBeVisible();
  });
});
