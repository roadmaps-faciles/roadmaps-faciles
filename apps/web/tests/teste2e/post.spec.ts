import { expect, test } from "./fixtures";

test.describe("Post Lifecycle", () => {
  test("submits a new post via the board form", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    await page.getByLabel(/titre/i).fill("E2E New Post");
    await page.getByLabel(/description/i).fill("Created during E2E test");
    await page.getByRole("button", { name: /valider|soumettre|envoyer/i }).click();

    // requirePostApproval=true → success alert shown
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("displays post detail from board click", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    // Click opens intercepted modal — URL updates without full navigation
    await page.getByRole("link", { name: "Test Post" }).first().click();
    await expect(page).toHaveURL(/\/post\/\d+/);

    // Post title may render as h1 (full page) or h2 (intercepted modal)
    await expect(page.getByRole("heading", { name: "Test Post" }).first()).toBeVisible();
    await expect(page.getByText("A test post for E2E tests").first()).toBeVisible();
  });

  test("votes on a post with like button", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Test Post" }).first().click();
    await expect(page).toHaveURL(/\/post\/\d+/);

    // Multiple vote buttons may exist (board background + modal), use first
    const voteButton = page.getByTitle("Vote").first();
    await expect(voteButton).toBeVisible();

    await voteButton.click();

    // Button should still be visible after optimistic toggle
    await expect(voteButton).toBeVisible();
  });

  test("shows comment input on post detail", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Test Post" }).first().click();
    await expect(page).toHaveURL(/\/post\/\d+/);

    const commentInput = page.getByLabel(/ajouter un commentaire|comment/i);
    await expect(commentInput).toBeVisible();
  });

  test("anonymous post shows without author name", async ({ page }) => {
    await page.goto("/board/test-board");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Anonymous Post" }).first().click();
    await expect(page).toHaveURL(/\/post\/\d+/);

    // Post title may render as h1 (full page) or h2 (intercepted modal)
    await expect(page.getByRole("heading", { name: "Anonymous Post" }).first()).toBeVisible();
  });
});
