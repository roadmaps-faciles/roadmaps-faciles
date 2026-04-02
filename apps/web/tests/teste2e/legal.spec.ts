import { expect, test } from "./fixtures";

test.describe("Legal Pages", () => {
  test("mentions légales page renders", async ({ page }) => {
    await page.goto("/mentions-legales");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/mentions légales/i);
    await expect(page.locator("main")).toContainText(/Scalingo/i);
  });

  test("politique de confidentialité page renders with cookies table", async ({ page }) => {
    await page.goto("/politique-de-confidentialite");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/politique de confidentialité/i);
    // Verify at least one real cookie is listed
    await expect(page.locator("main")).toContainText("authjs.session-token");
  });

  test("accessibilité page renders", async ({ page }) => {
    await page.goto("/accessibilite");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/accessibilité/i);
    await expect(page.locator("main")).toContainText(/non conforme/i);
  });

  test("CGU page renders with placeholder", async ({ page }) => {
    await page.goto("/cgu");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/conditions générales/i);
    await expect(page.locator("main")).toContainText(/en cours de rédaction/i);
  });

  test("footer links navigate to legal pages", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");

    // Click mentions légales link in footer
    const mentionsLink = footer.getByRole("link", { name: /mentions légales/i });
    await expect(mentionsLink).toBeVisible();
    await mentionsLink.click();

    await expect(page).toHaveURL(/mentions-legales/);
    // Use name filter instead of level-only to avoid strict mode violation
    // (during soft navigation, old + new h1 may coexist briefly)
    await expect(page.getByRole("heading", { name: /mentions légales/i })).toBeVisible();
  });
});
