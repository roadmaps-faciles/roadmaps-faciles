import { expect, test } from "./fixtures";

test.describe("API Routes", () => {
  test("GET /api/domains/check returns status for known domain", async ({ request }) => {
    const response = await request.get("/api/domains/check?domain=e2e.localhost");

    // 200 (found) or 404 (not found as custom domain) — not 500
    expect([200, 404]).toContain(response.status());
  });

  test("POST /api/subdomain/check returns tenant for known subdomain", async ({ request }) => {
    const response = await request.post("/api/subdomain/check", {
      data: { subdomain: "e2e" },
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body).toHaveProperty("id");
  });
});
