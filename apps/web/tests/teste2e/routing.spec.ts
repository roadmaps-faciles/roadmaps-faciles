import { E2E_TENANT_URL, expect, test } from "./fixtures";

test.describe("Routing & Pages", () => {
  test("tenant home is accessible via subdomain", async ({ page }) => {
    await page.goto(`${E2E_TENANT_URL}/`);

    // Should show tenant content (not root home)
    await expect(page.locator("main")).toBeVisible();
  });

  test("stats page is accessible", async ({ page }) => {
    await page.goto("/stats");

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("roadmap page is accessible on tenant", async ({ page }) => {
    await page.goto(`${E2E_TENANT_URL}/roadmap`);

    await expect(page.locator("main")).toBeVisible();
  });

  test("error page displays content", async ({ page }) => {
    await page.goto("/error");

    await expect(page.locator("main")).toBeVisible();
  });
});
