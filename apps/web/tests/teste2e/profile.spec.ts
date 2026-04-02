import { expect, test } from "./fixtures";

test.describe("User Profile", () => {
  test("profile page shows user information", async ({ page }) => {
    await page.goto("/profile");

    await expect(page.getByRole("textbox", { name: /e-mail/i })).toHaveValue("test-admin@test.local");
  });

  test("security page shows 2FA options", async ({ page }) => {
    await page.goto("/profile/security");

    await expect(page.locator("main")).toContainText(/passkey|OTP|2FA|authentification/i);
  });
});
