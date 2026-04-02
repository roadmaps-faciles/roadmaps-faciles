import { E2E_TENANT_URL, expect, test } from "./fixtures";

test.describe("Magic Link Authentication (tenant)", () => {
  test("full magic link login on tenant", async ({ page, maildev }) => {
    await maildev.clearInbox();

    // Navigate to tenant login page
    await page.goto(`${E2E_TENANT_URL}/login`);

    // Fill email and submit
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test-user@test.local");

    await page.getByRole("button", { name: /connexion/i }).click();

    // Wait for redirect to verify-request page
    await page.waitForURL("**/login/verify-request*");
    await expect(page.getByText(/email envoy/i)).toBeVisible();

    // Retrieve the magic link email from Maildev
    const email = await maildev.getLatestEmail("test-user@test.local");
    expect(email.subject).toBeTruthy();

    // Extract and validate the magic link
    const magicLink = maildev.extractLink(email);
    expect(magicLink).toContain("/api/auth/callback/nodemailer");

    // Navigate to the magic link to complete authentication.
    // The callback is processed on the root domain (localhost:3000) because NextAuth
    // API routes live under (default). The redirect() callback respects callbackUrl,
    // which points to the tenant domain.
    await page.goto(magicLink);
    await page.waitForURL(`${E2E_TENANT_URL}/**`, { timeout: 15_000 });

    // Verify authenticated state: the "Connexion" button should no longer be visible
    await expect(page.getByRole("button", { name: /connexion/i })).not.toBeVisible();
  });

  test("invalid/expired callback token shows error page", async ({ page }) => {
    // Navigate directly to the callback with a garbage token
    await page.goto(
      `${E2E_TENANT_URL}/api/auth/callback/nodemailer?token=invalid-garbage-token&email=test-user@test.local`,
    );

    // Should end up on an error page
    await expect(page).toHaveURL(/\/error/);

    // Verify main content is visible (error message rendered)
    await expect(page.locator("main")).toBeVisible();
  });

  test("pre-login OTP blocking shows OTP input instead of sending magic link", async ({ page }) => {
    // Navigate to tenant login page
    await page.goto(`${E2E_TENANT_URL}/login`);

    // Fill email for the OTP-configured user and submit
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test-otp@test.local");

    await page.getByRole("button", { name: /connexion/i }).click();

    // The pre-login-check API should return requiresOtp: true,
    // causing the form to show an OTP code input instead of sending the magic link.
    const otpInput = page.getByRole("textbox", { name: /code/i });
    await expect(otpInput).toBeVisible({ timeout: 10_000 });

    // Verify the OTP input has numeric inputMode
    await expect(otpInput).toHaveAttribute("inputmode", "numeric");
  });
});
