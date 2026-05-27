import { E2E_TENANT_URL, expect, test } from "./fixtures";

test.describe("Authentication Pages", () => {
  test("root login page shows connexion form", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/.+/);
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();
  });

  test("tenant login page is accessible via subdomain", async ({ page }) => {
    await page.goto(`${E2E_TENANT_URL}/login`);

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("2FA page redirects or loads", async ({ page }) => {
    await page.goto("/2fa");

    // Without auth, may redirect to login - verify no 500
    expect(page.url()).toMatch(/\/(2fa|login)/);
  });

  test("login error page displays error info", async ({ page }) => {
    await page.goto("/login/error?error=OAuthSignin");

    await expect(page.locator("main")).toContainText(/.+/);
  });
});
