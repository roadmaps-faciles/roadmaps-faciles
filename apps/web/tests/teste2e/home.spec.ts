import { expect, test } from "./fixtures";

test.describe("Home Page", () => {
  test("is accessible and has a title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);
  });

  test("contains a call-to-action link", async ({ page }) => {
    await page.goto("/");

    const ctaLink = page.getByRole("link", { name: /commencer/i }).first();
    await expect(ctaLink).toBeVisible();
  });

  test("has a footer", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("has a sticky header with navigation", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Header should contain the brand name link
    const brandLink = header.getByRole("link").first();
    await expect(brandLink).toBeVisible();
  });

  test("header shows login and get-started links for unauthenticated users", async ({ page }) => {
    await page.goto("/");

    const loginLink = page.getByRole("link", { name: /connexion/i });
    await expect(loginLink).toBeVisible();

    const getStartedLink = page.getByRole("link", { name: /commencer/i }).first();
    await expect(getStartedLink).toBeVisible();
  });

  test("dark mode class is applied based on localStorage", async ({ page }) => {
    // Set dark theme in localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });
    await page.goto("/");

    // ThemeScript should have added .dark to <html>
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });

  test("light mode is default when no theme is stored", async ({ page }) => {
    await page.goto("/");

    // Without stored theme and with default system preference, <html> should NOT have .dark
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
  });
});
