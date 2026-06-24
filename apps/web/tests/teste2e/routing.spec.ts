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

  // #25 - forcer le redirect canonical vers le custom domain
  test("redirects the subdomain to the custom domain (308) when the flag is on", async ({ request }) => {
    const res = await request.get("http://canon.localhost:3000/", { maxRedirects: 0 });

    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toContain("canonical.example.com");
  });

  test("does not redirect a tenant without a custom domain", async ({ request }) => {
    const res = await request.get(`${E2E_TENANT_URL}/`, { maxRedirects: 0 });

    expect(res.status()).not.toBe(308);
  });
});
