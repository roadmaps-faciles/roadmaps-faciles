import { isValidStorageKey } from "@/lib/ee/storage-provider/validation";

describe("uploads route - isValidStorageKey", () => {
  describe("valid keys", () => {
    it.each([
      // images/ (markdown embed, no tenant scoping)
      "images/abc.png",
      "images/my-image.jpg",
      "images/550e8400-e29b-41d4-a716-446655440000.webp",
      "images/file_name.gif",
      "images/UPPERCASE.PNG",
      // avatars/{userId}/  (userId = CUID, alphanumérique)
      "avatars/cmpp9hiej00000s1tclmv1ku/abc.png",
      "avatars/cmpp9hiej00000s1tclmv1ku/550e8400-e29b-41d4-a716-446655440000.webp",
      // tenants/{tenantId}/{logo|banner}
      "tenants/1/logo.png",
      "tenants/42/banner.webp",
      "tenants/1/logo-dark.png",
      "tenants/1/banner-mobile.jpg",
      // legacy tenants/{tenantId}/images/
      "tenants/1/images/abc.png",
      "tenants/999/images/550e8400-e29b-41d4-a716-446655440000.webp",
    ])("accepts %s", key => {
      expect(isValidStorageKey(key)).toBe(true);
    });
  });

  describe("invalid keys", () => {
    it.each([
      ["path traversal", "../etc/passwd"],
      ["unknown prefix", "secrets/file.png"],
      ["images with extra subdir", "images/sub/file.png"],
      ["images missing extension", "images/noext"],
      ["images with spaces", "images/my file.png"],
      ["images multi-dot", "images/my.file.png"],
      ["images query string", "images/file.png?foo=bar"],
      ["avatars missing file", "avatars/cmpp9hiej00000s1tclmv1ku/"],
      ["avatars extra subdir", "avatars/cmpp9hiej00000s1tclmv1ku/sub/file.png"],
      ["avatars special char userId", "avatars/cmpp.9hiej/file.png"],
      ["tenant asset unknown type", "tenants/1/footer.png"],
      ["tenant asset non-numeric id", "tenants/abc/logo.png"],
      ["legacy non-numeric tenant ID", "tenants/abc/images/file.png"],
      ["legacy extra subdirectory", "tenants/1/images/sub/file.png"],
      ["legacy double dots in path", "tenants/1/../images/file.png"],
      ["empty key", ""],
    ])("rejects %s: %s", (_label, key) => {
      expect(isValidStorageKey(key)).toBe(false);
    });
  });
});
