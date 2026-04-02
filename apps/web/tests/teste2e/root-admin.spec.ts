import { expect, test } from "./fixtures";

test.describe("Root Admin", () => {
  test("tenant list shows the E2E tenant", async ({ page }) => {
    await page.goto("/admin/tenants");

    await expect(page.getByText("E2E Test Tenant")).toBeVisible();
  });

  test("create tenant page is accessible", async ({ page }) => {
    await page.goto("/admin/tenants/new");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/tenant|créer/i);
  });

  test("users list shows test users", async ({ page }) => {
    await page.goto("/admin/users");

    await expect(page.getByRole("cell", { name: "test-admin@test.local" }).first()).toBeVisible();
  });

  test("audit log shows entries", async ({ page }) => {
    await page.goto("/admin/audit-log");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/audit/i);
    await expect(page.locator("table")).toBeVisible();
    await expect(page.getByRole("cell", { name: "ROOT_TENANT_CREATE" })).toBeVisible();
  });

  test("security page is accessible", async ({ page }) => {
    await page.goto("/admin/security");

    await expect(page.locator("main")).toContainText(/2FA|double authentification/i);
  });

  test.describe("Pin tenant", () => {
    /** Navigate to admin tenants and return the E2E tenant card + both button locators. */
    async function getTenantRow(page: import("@playwright/test").Page) {
      await page.goto("/admin/tenants");
      const card = page.locator("[class*=card]").filter({ hasText: "E2E Test Tenant" });
      const pinBtn = card.getByRole("button", { name: /^épingler$/i });
      const unpinBtn = card.getByRole("button", { name: /^désépingler$/i });
      // Wait for either button to appear (handles SSR streaming)
      await expect(pinBtn.or(unpinBtn)).toBeVisible();
      return { row: card, pinBtn, unpinBtn };
    }

    /** Ensure the tenant is unpinned (idempotent). */
    async function ensureUnpinned(page: import("@playwright/test").Page) {
      const { pinBtn, unpinBtn } = await getTenantRow(page);
      if (await unpinBtn.isVisible()) {
        await unpinBtn.click();
        await expect(pinBtn).toBeVisible();
      }
    }

    /** Ensure the tenant is pinned (idempotent). */
    async function ensurePinned(page: import("@playwright/test").Page) {
      const { pinBtn, unpinBtn } = await getTenantRow(page);
      if (await pinBtn.isVisible()) {
        await pinBtn.click();
        await expect(unpinBtn).toBeVisible();
      }
    }

    test.afterEach(async ({ page }) => {
      await ensureUnpinned(page);
    });

    test("pin button is visible on each tenant row", async ({ page }) => {
      await ensureUnpinned(page);
      const { pinBtn } = await getTenantRow(page);

      await expect(pinBtn).toBeVisible();
    });

    test("clicking pin button pins the tenant", async ({ page }) => {
      await ensureUnpinned(page);
      const { pinBtn, unpinBtn } = await getTenantRow(page);

      await pinBtn.click();

      await expect(unpinBtn).toBeVisible();
    });

    test("pinned tenant is displayed on roadmap page", async ({ page }) => {
      await ensurePinned(page);

      await expect(async () => {
        await page.goto("/roadmap");
        await expect(page.getByText("Test Post")).toBeVisible({ timeout: 3000 });
      }).toPass({ intervals: [1_000, 2_000], timeout: 15_000 });
    });

    test("unpinning tenant shows not-configured on roadmap", async ({ page }) => {
      await ensurePinned(page);
      const { pinBtn, unpinBtn } = await getTenantRow(page);

      await unpinBtn.click();
      await expect(pinBtn).toBeVisible();

      await expect(async () => {
        await page.goto("/roadmap");
        await expect(page.locator("main")).toContainText(/n'est pas configurée|not configured/i, { timeout: 3000 });
      }).toPass({ intervals: [1_000, 2_000], timeout: 15_000 });
    });

    test("roadmap shows not-configured when no tenant is pinned", async ({ page }) => {
      await ensureUnpinned(page);

      await expect(async () => {
        await page.goto("/roadmap");
        await expect(page.locator("main")).toContainText(/n'est pas configurée|not configured/i, { timeout: 3000 });
      }).toPass({ intervals: [1_000, 2_000], timeout: 15_000 });
    });
  });
});
