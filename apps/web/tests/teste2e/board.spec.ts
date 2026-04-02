import { expect, test } from "./fixtures";

test.describe("Board Page", () => {
  test("displays approved posts and hides pending ones", async ({ page }) => {
    await page.goto("/board/test-board");

    await expect(page.getByRole("link", { name: "Test Post" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Anonymous Post" }).first()).toBeVisible();
    await expect(page.getByText("Pending Post")).not.toBeVisible();
  });

  test("toggles between cards and list views", async ({ page }) => {
    await page.goto("/board/test-board?view=list");
    await expect(page).toHaveURL(/view=list/);
    await expect(page.getByRole("link", { name: "Test Post" }).first()).toBeVisible();

    await page.goto("/board/test-board?view=cards");
    await expect(page).toHaveURL(/view=cards/);
    await expect(page.getByRole("link", { name: "Test Post" }).first()).toBeVisible();
  });

  test("navigates between boards", async ({ page }) => {
    await page.goto("/board/test-board");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Test Board");

    await page.goto("/board/second-board");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Second Board");
  });
});
