import { VALID_STORAGE_KEY_PATTERN } from "@/lib/ee/storage-provider/validation";

describe("uploads route - VALID_STORAGE_KEY_PATTERN", () => {
  describe("valid keys", () => {
    it.each([
      "tenants/1/images/abc.png",
      "tenants/123/images/my-image.jpg",
      "tenants/999/images/550e8400-e29b-41d4-a716-446655440000.webp",
      "tenants/1/images/file_name.gif",
      "tenants/42/images/UPPERCASE.PNG",
    ])("accepts %s", key => {
      expect(VALID_STORAGE_KEY_PATTERN.test(key)).toBe(true);
    });
  });

  describe("invalid keys", () => {
    it.each([
      ["path traversal", "../etc/passwd"],
      ["no tenants prefix", "images/file.png"],
      ["non-numeric tenant ID", "tenants/abc/images/file.png"],
      ["missing extension", "tenants/1/images/noext"],
      ["extra subdirectory", "tenants/1/images/sub/file.png"],
      ["empty key", ""],
      ["spaces in filename", "tenants/1/images/my file.png"],
      ["double dots in path", "tenants/1/../images/file.png"],
      ["missing images segment", "tenants/1/file.png"],
      ["query string", "tenants/1/images/file.png?foo=bar"],
      ["multi-dot filename", "tenants/1/images/my.file.png"],
    ])("rejects %s: %s", (_label, key) => {
      expect(VALID_STORAGE_KEY_PATTERN.test(key)).toBe(false);
    });
  });
});
