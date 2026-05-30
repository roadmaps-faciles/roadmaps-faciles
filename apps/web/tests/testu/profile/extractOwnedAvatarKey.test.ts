import { extractOwnedAvatarKey } from "@/app/(default)/(authenticated)/profile/avatarKey";

const USER_ID = "cmpp9hiej00000s1tclmv1ku";

describe("extractOwnedAvatarKey", () => {
  describe("returns null", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["empty string", ""],
    ])("for %s imageUrl", (_label, imageUrl) => {
      expect(extractOwnedAvatarKey(imageUrl, USER_ID)).toBeNull();
    });

    it.each([
      ["espace-membre external avatar", "https://espace-membre.incubateur.net/api/image/foo.jpg"],
      ["github oauth avatar", "https://avatars.githubusercontent.com/u/12345?v=4"],
      ["arbitrary external url", "https://cdn.example.com/avatar.png"],
    ])("for external url (%s)", (_label, imageUrl) => {
      expect(extractOwnedAvatarKey(imageUrl, USER_ID)).toBeNull();
    });

    it("for an avatar owned by another user", () => {
      const otherUserId = "cmother0000000000000000zz";
      const imageUrl = `/api/uploads/avatars/${otherUserId}/550e8400-e29b-41d4-a716-446655440000.png`;
      expect(extractOwnedAvatarKey(imageUrl, USER_ID)).toBeNull();
    });

    it("for an internal upload that is not an avatar (markdown image)", () => {
      expect(extractOwnedAvatarKey("/api/uploads/images/abc.png", USER_ID)).toBeNull();
    });

    it("when the userId is only a prefix-substring of the path segment", () => {
      // /api/uploads/avatars/<USER_ID>X/... ne doit pas matcher : le séparateur `/`
      // après l'userId garantit qu'on cible exactement le dossier de ce user.
      const imageUrl = `/api/uploads/avatars/${USER_ID}X/abc.png`;
      expect(extractOwnedAvatarKey(imageUrl, USER_ID)).toBeNull();
    });
  });

  describe("returns the storage key (sans le préfixe /api/uploads/)", () => {
    it("for an owned avatar with a png uuid filename", () => {
      const imageUrl = `/api/uploads/avatars/${USER_ID}/550e8400-e29b-41d4-a716-446655440000.png`;
      expect(extractOwnedAvatarKey(imageUrl, USER_ID)).toBe(
        `avatars/${USER_ID}/550e8400-e29b-41d4-a716-446655440000.png`,
      );
    });

    it.each(["png", "jpg", "webp", "gif"])("for an owned avatar with .%s extension", ext => {
      const imageUrl = `/api/uploads/avatars/${USER_ID}/abc.${ext}`;
      expect(extractOwnedAvatarKey(imageUrl, USER_ID)).toBe(`avatars/${USER_ID}/abc.${ext}`);
    });
  });
});
