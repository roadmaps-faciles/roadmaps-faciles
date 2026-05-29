import { isSafeRelativeCallbackUrl, withCallbackUrl } from "@/app/(default)/login/loginHrefs";

describe("loginHrefs", () => {
  describe("isSafeRelativeCallbackUrl", () => {
    it.each([
      ["/", true],
      ["/api/auth-bridge?redirect=https%3A%2F%2Ftenant.example.com%2F", true],
      ["/login/passwordless", true],
      ["/login?callbackUrl=%2F", true],
    ])("accepts %s", (input, expected) => {
      expect(isSafeRelativeCallbackUrl(input)).toBe(expected);
    });

    it.each([
      ["https://evil.com/", false],
      ["http://evil.com/", false],
      ["//evil.com/", false],
      ["javascript:alert(1)", false],
      ["evil.com", false],
      ["", false],
      [null, false],
      [undefined, false],
    ])("rejects %s", (input, expected) => {
      expect(isSafeRelativeCallbackUrl(input)).toBe(expected);
    });
  });

  describe("withCallbackUrl", () => {
    it("appends safe relative callbackUrl as encoded query param", () => {
      expect(withCallbackUrl("/login/passwordless", "/api/auth-bridge?redirect=https://x.com/")).toBe(
        "/login/passwordless?callbackUrl=%2Fapi%2Fauth-bridge%3Fredirect%3Dhttps%3A%2F%2Fx.com%2F",
      );
    });

    it("returns basePath unchanged when callbackUrl is missing", () => {
      expect(withCallbackUrl("/login", undefined)).toBe("/login");
      expect(withCallbackUrl("/login", null)).toBe("/login");
    });

    it("returns basePath unchanged when callbackUrl is unsafe (open redirect attempt)", () => {
      expect(withCallbackUrl("/login", "https://evil.com/")).toBe("/login");
      expect(withCallbackUrl("/login", "//evil.com/")).toBe("/login");
      expect(withCallbackUrl("/login", "javascript:alert(1)")).toBe("/login");
    });
  });
});
