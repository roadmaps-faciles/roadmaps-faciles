import { expect, test } from "./fixtures";

test.describe("Tenant Admin", () => {
  test("can create a new board", async ({ page }) => {
    await page.goto("/admin/boards");

    const nameInput = page.getByLabel(/nom|name/i).first();
    await nameInput.fill("E2E Created Board");

    const createButton = page.getByRole("button", { name: /ajouter|add/i });
    await createButton.click();

    await expect(page.getByText("E2E Created Board").first()).toBeVisible();
  });

  test("displays post statuses", async ({ page }) => {
    await page.goto("/admin/statuses");

    await expect(page.getByText("En cours")).toBeVisible();
    await expect(page.getByText("Terminé")).toBeVisible();
  });

  test("lists tenant members with roles", async ({ page }) => {
    await page.goto("/admin/users");

    await expect(page.getByText("test-admin@test.local")).toBeVisible();
    await expect(page.getByText("test-mod@test.local")).toBeVisible();
    await expect(page.getByText("test-user@test.local")).toBeVisible();
  });

  test("member role badges are displayed", async ({ page }) => {
    await page.goto("/admin/users");

    // French locale: role labels are "Propriétaire", "Modérateur", "Utilisateur"
    // Target table cell (not hidden <option> inside <select>)
    await expect(
      page
        .locator("td")
        .filter({ hasText: /propriétaire/i })
        .first(),
    ).toBeVisible();
  });

  test("shows invitation list with pending invitation", async ({ page }) => {
    await page.goto("/admin/users/invitations");

    await expect(page.getByText("invited@test.local")).toBeVisible();
  });

  test("general settings page shows tenant name", async ({ page }) => {
    await page.goto("/admin/general");

    await expect(page.getByText("E2E Test Tenant")).toBeVisible();
  });
});
