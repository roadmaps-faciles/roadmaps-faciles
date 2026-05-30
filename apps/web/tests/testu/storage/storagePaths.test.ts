import {
  ALLOWED_IMAGE_TYPES,
  imageExtensionForType,
  isValidStorageKey,
  storagePaths,
} from "@/lib/ee/storage-provider/validation";

const UUID = "550e8400-e29b-41d4-a716-446655440000";
const USER_ID = "cmpp9hiej00000s1tclmv1ku";

describe("storagePaths round-trips through isValidStorageKey", () => {
  it("image() builds a key accepted by the validator", () => {
    const key = storagePaths.image(UUID, "png");
    expect(key).toBe(`images/${UUID}.png`);
    expect(isValidStorageKey(key)).toBe(true);
  });

  it("avatar() builds a key accepted by the validator", () => {
    const key = storagePaths.avatar(USER_ID, UUID, "webp");
    expect(key).toBe(`avatars/${USER_ID}/${UUID}.webp`);
    expect(isValidStorageKey(key)).toBe(true);
  });

  it("avatar() with a numeric userId is accepted", () => {
    const key = storagePaths.avatar(42, UUID, "jpg");
    expect(key).toBe(`avatars/42/${UUID}.jpg`);
    expect(isValidStorageKey(key)).toBe(true);
  });

  it("tenantAsset() logo without suffix is accepted", () => {
    const key = storagePaths.tenantAsset(1, "logo", "png");
    expect(key).toBe("tenants/1/logo.png");
    expect(isValidStorageKey(key)).toBe(true);
  });

  it("tenantAsset() banner with a suffix is accepted", () => {
    const key = storagePaths.tenantAsset(42, "banner", "webp", "dark");
    expect(key).toBe("tenants/42/banner-dark.webp");
    expect(isValidStorageKey(key)).toBe(true);
  });

  it("builds avatar keys accepted by the validator for every allowed image type", () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      const ext = imageExtensionForType(type);
      const key = storagePaths.avatar(USER_ID, UUID, ext);
      expect(isValidStorageKey(key)).toBe(true);
    }
  });
});

describe("imageExtensionForType", () => {
  it.each([
    ["image/gif", "gif"],
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ])("maps %s to %s", (type, expected) => {
    expect(imageExtensionForType(type)).toBe(expected);
  });

  it.each([["application/pdf"], ["image/svg+xml"], ["text/plain"], [""]])(
    "falls back to 'bin' for unknown type (%s)",
    type => {
      expect(imageExtensionForType(type)).toBe("bin");
    },
  );
});
