import { expect, test } from "./fixtures";

test.describe("Search", () => {
  test("docs search API returns response", async ({ request }) => {
    const response = await request.get("http://localhost:3000/api/search?query=test");

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(Array.isArray(body) || typeof body === "object").toBe(true);
  });
});
