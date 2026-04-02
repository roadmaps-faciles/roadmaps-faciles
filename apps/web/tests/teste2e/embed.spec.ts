import { E2E_TENANT_URL, expect, test } from "./fixtures";

test.describe("Embed Pages", () => {
  test.describe("Board embed", () => {
    test("renders board without site chrome", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board`);
      await page.waitForLoadState("networkidle");

      // No DSFR header or domain navigation
      await expect(page.locator("header.fr-header")).not.toBeVisible();

      // Board content is shown
      await expect(page.getByRole("heading", { level: 2 })).toContainText("Test Board");

      // Footer shows "Propulsé par"
      await expect(page.locator("footer")).toContainText(/propulsé par/i);
    });

    test("shows approved posts only", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("link", { name: "Test Post" }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Anonymous Post" }).first()).toBeVisible();
      await expect(page.getByText("Pending Post")).not.toBeVisible();
      await expect(page.getByText("Rejected Post")).not.toBeVisible();
    });

    test("view=list renders compact post list", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board?view=list`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading", { level: 2 })).toContainText("Test Board");
      await expect(page.getByRole("link", { name: "Test Post" }).first()).toBeVisible();
    });

    test("hideVotes=true hides vote buttons", async ({ page }) => {
      // Default: votes visible (allowVoting=true in seed)
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("[data-testid='like-button']").first()).toBeVisible();

      // With hideVotes=true: no vote buttons
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board?hideVotes=true`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("[data-testid='like-button']")).toHaveCount(0);
    });

    test("theme=dark forces dark mode", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board?theme=dark`);
      await page.waitForLoadState("networkidle");

      // DSFR theme mutation is async (client-side useEffect + dsfr.start())
      await page.waitForFunction(() => document.documentElement.getAttribute("data-fr-theme") === "dark", {
        timeout: 10_000,
      });
      await expect(page.locator("html")).toHaveAttribute("data-fr-theme", "dark");
    });

    test("post links open in new tab", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/board/test-board`);
      await page.waitForLoadState("networkidle");

      const postLinks = page.locator("main a[target='_blank']");
      const count = await postLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Roadmap embed", () => {
    test("renders kanban columns with status names", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/roadmap`);
      await page.waitForLoadState("networkidle");

      // No DSFR header
      await expect(page.locator("header.fr-header")).not.toBeVisible();

      // Status columns visible
      await expect(page.getByText("En cours")).toBeVisible();
      await expect(page.getByText("Terminé")).toBeVisible();

      // Footer
      await expect(page.locator("footer")).toContainText(/propulsé par/i);
    });

    test("shows post in its status column", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/roadmap`);
      await page.waitForLoadState("networkidle");

      // testPost has statusEnCours, should appear in the roadmap
      await expect(page.getByText("Test Post").first()).toBeVisible();
    });

    test("hideVotes=true hides vote buttons", async ({ page }) => {
      await page.goto(`${E2E_TENANT_URL}/embed/roadmap?hideVotes=true`);
      await page.waitForLoadState("networkidle");

      await expect(page.locator("[data-testid='like-button']")).toHaveCount(0);
    });
  });

  test.describe("CSP headers", () => {
    test("embed route does not have X-Frame-Options DENY", async ({ page }) => {
      const response = await page.goto(`${E2E_TENANT_URL}/embed/board/test-board`);

      const xfo = response?.headers()["x-frame-options"];
      expect(xfo).not.toBe("DENY");
    });

    test("non-embed route has X-Frame-Options DENY", async ({ page }) => {
      const response = await page.goto(`${E2E_TENANT_URL}/board/test-board`);

      const xfo = response?.headers()["x-frame-options"];
      expect(xfo).toBe("DENY");
    });
  });
});
