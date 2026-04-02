import { expect, test } from "./fixtures";

test.describe("Health Check", () => {
  test("GET /api/healthz returns 200 with status", async ({ request }) => {
    const response = await request.get("/api/healthz");

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
  });
});
