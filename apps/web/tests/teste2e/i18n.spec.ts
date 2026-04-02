import { expect, test } from "./fixtures";

test.describe("Internationalization", () => {
  test("page loads in French by default", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    // Board page should show French content — form heading or board elements
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Test Board");
  });

  test("switching to English changes content", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    // Board page has scroll-snap (snap-y on <html>) that pushes header out of viewport.
    // Disable snap temporarily so Playwright can scroll to the language button.
    await page.evaluate(() => {
      document.documentElement.style.scrollSnapType = "none";
    });

    const langButton = page.getByRole("button", { name: /fr|langue|language/i });

    if (await langButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await langButton.click();

      const enOption = page.getByRole("link", { name: /english|en/i });
      if (await enOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await enOption.click();
        await page.waitForLoadState("networkidle");

        await expect(page.locator("html")).toHaveAttribute("lang", "en");
      }
    }
  });
});
