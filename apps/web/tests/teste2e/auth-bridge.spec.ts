import { E2E_TENANT_URL, expect, test } from "./fixtures";

/**
 * Auth Bridge E2E Tests
 *
 * The auth bridge transfers a user session from the root domain to a tenant
 * subdomain via an HMAC token. The bridge endpoint is GET /api/auth-bridge.
 *
 * This file runs in TWO Playwright projects:
 *   - root-auth (admin authenticated on root, storageState: admin.json)
 *   - unauthenticated (no session)
 *
 * Authenticated tests skip gracefully when no session is available.
 */

// ---------------------------------------------------------------------------
// Helper: detect whether we actually have a root session
// ---------------------------------------------------------------------------
async function hasRootSession(page: import("@playwright/test").Page): Promise<boolean> {
  await page.goto("/");
  // Root uses shadcn Header — ShadcnUserHeaderItem renders:
  //   loading: Skeleton
  //   authenticated: DropdownMenu trigger (button with aria-haspopup="menu")
  //   unauthenticated: "Connexion" link
  const loginLink = page.locator("header").getByRole("link", { name: /connexion/i });
  const userDropdown = page.locator('header [aria-haspopup="menu"]');
  // Wait for either the login link (unauthenticated) or user dropdown (authenticated).
  await Promise.race([
    loginLink.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {}),
    userDropdown.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {}),
  ]);
  return !(await loginLink.isVisible());
}

// ---------------------------------------------------------------------------
// Authenticated tests (root-auth project — admin already logged in on root)
// ---------------------------------------------------------------------------
test.describe("Auth Bridge — authenticated", () => {
  test("bridge completes root → tenant session transfer", async ({ page }) => {
    const authed = await hasRootSession(page);
    test.skip(!authed, "Requires root-auth session");

    // Navigate to the bridge endpoint with a redirect to the tenant login page
    const bridgeUrl = `/api/auth-bridge?redirect=${encodeURIComponent(E2E_TENANT_URL + "/login")}`;
    await page.goto(bridgeUrl, { waitUntil: "networkidle" });

    // BridgeAutoLogin processes the token and redirects to tenant home on success.
    // Wait for navigation to settle on the tenant domain.
    await page.waitForURL(url => url.origin === E2E_TENANT_URL && !url.searchParams.has("bridge_token"), {
      timeout: 30_000,
    });

    // Verify we are now authenticated on the tenant by accessing the tenant admin page
    await page.goto(`${E2E_TENANT_URL}/admin`);
    await expect(page.locator("main")).toBeVisible();
    // Should NOT have been redirected to tenant login
    expect(page.url()).not.toContain("/login");
  });

  test("no redirect param → redirects to root home", async ({ page }) => {
    const authed = await hasRootSession(page);
    test.skip(!authed, "Requires root-auth session");

    await page.goto("/api/auth-bridge", { waitUntil: "networkidle" });

    // Should end up at root home
    expect(page.url()).toMatch(/^http:\/\/localhost:3000\/?$/);
  });

  test("external redirect is blocked → redirects to root home", async ({ page }) => {
    const authed = await hasRootSession(page);
    test.skip(!authed, "Requires root-auth session");

    await page.goto("/api/auth-bridge?redirect=https://evil.example.com/steal", { waitUntil: "networkidle" });

    // Should NOT be at the evil domain — should be at root home
    expect(page.url()).not.toContain("evil.example.com");
    expect(page.url()).toMatch(/^http:\/\/localhost:3000\/?$/);
  });
});

// ---------------------------------------------------------------------------
// Unauthenticated tests (unauthenticated project — no session)
// ---------------------------------------------------------------------------
test.describe("Auth Bridge — unauthenticated", () => {
  test("unauthenticated user → redirects to root login", async ({ page }) => {
    const authed = await hasRootSession(page);
    test.skip(authed, "Only meaningful without a session");

    const bridgeUrl = `/api/auth-bridge?redirect=${encodeURIComponent(E2E_TENANT_URL + "/login")}`;
    await page.goto(bridgeUrl, { waitUntil: "networkidle" });

    // Should end up at root login (not on the tenant)
    expect(page.url()).toMatch(/^http:\/\/localhost:3000\/login/);
  });

  test("invalid bridge token on tenant login → error redirect", async ({ page }) => {
    // Go directly to tenant login with a garbage bridge token
    await page.goto(`${E2E_TENANT_URL}/login?bridge_token=invalid-garbage-token`, { waitUntil: "networkidle" });

    // BridgeAutoLogin will try to authenticate with the invalid token and fail.
    // On failure it redirects to /login?error=...
    await page.waitForURL(
      url => url.origin === E2E_TENANT_URL && url.pathname === "/login" && url.searchParams.has("error"),
      {
        timeout: 30_000,
      },
    );

    expect(page.url()).toContain("/login?error=");
    expect(page.url()).not.toContain("bridge_token=");
  });
});
