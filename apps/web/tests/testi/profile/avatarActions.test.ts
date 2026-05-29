import { type Mock } from "vitest";

// `actions.ts` est "use server" : on doit stub toute sa chaîne d'imports server-only
// (espaceMembre, next-auth via @/utils/auth, repo singleton, storage factory, audit,
// next/cache, next-intl) avant de l'importer dynamiquement. Pattern vi.doMock +
// await import() (cf. CLAUDE.md, modules à state singleton).

const USER_ID = "cmpp9hiej00000s1tclmv1ku";

interface AvatarActions {
  removeAvatar: () => Promise<{ error?: string; ok: boolean }>;
  uploadAvatar: (formData: FormData) => Promise<{ data?: { url: string }; error?: string; ok: boolean }>;
}

let userRepoFindById: Mock;
let userRepoUpdate: Mock;
let storageUpload: Mock;
let storageDelete: Mock;
let revalidatePathMock: Mock;

const MAX_FILE_SIZE_MB = 5;

// `UpdateUser.execute` fait `User.parse(...)` sur le retour de `userRepo.update`,
// donc le mock doit renvoyer un user complet et valide vis-à-vis du schéma zod.
const fakeUser = (overrides: Record<string, unknown> = {}) => ({
  id: USER_ID,
  name: "Test",
  email: "test@example.com",
  emailVerified: null,
  username: null,
  image: null,
  notificationsEnabled: true,
  status: "ACTIVE",
  role: "USER",
  signInCount: 0,
  currentSignInAt: null,
  lastSignInAt: null,
  currentSignInIp: null,
  lastSignInIp: null,
  recapNotificationFrequency: 0,
  isBetaGouvMember: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const setup = async (): Promise<AvatarActions> => {
  vi.resetModules();

  userRepoFindById = vi.fn();
  userRepoUpdate = vi
    .fn()
    .mockImplementation((_id: string, data: Record<string, unknown>) => Promise.resolve(fakeUser(data)));
  storageUpload = vi.fn().mockResolvedValue(undefined);
  storageDelete = vi.fn().mockResolvedValue(undefined);
  revalidatePathMock = vi.fn();

  vi.doMock("@/lib/gouv/espaceMembre", () => ({
    espaceMembreClient: { member: { getByUsername: vi.fn() } },
    getEmUserEmail: vi.fn(),
    createEmLinkToken: vi.fn(),
    verifyEmLinkToken: vi.fn(),
  }));

  vi.doMock("@/utils/auth", () => ({
    assertSession: vi.fn().mockResolvedValue({ user: { uuid: USER_ID } }),
  }));

  vi.doMock("@/utils/audit", () => ({
    audit: vi.fn(),
    getRequestContext: vi.fn().mockResolvedValue({}),
    AuditAction: { IMAGE_UPLOAD: "IMAGE_UPLOAD", PROFILE_UPDATE: "PROFILE_UPDATE" },
  }));

  vi.doMock("@/lib/repo", () => ({
    userRepo: { findById: userRepoFindById, update: userRepoUpdate },
  }));

  vi.doMock("@/lib/ee/storage-provider", () => ({
    getStorageProvider: () => ({ upload: storageUpload, delete: storageDelete }),
  }));

  vi.doMock("next/cache", () => ({
    revalidatePath: revalidatePathMock,
  }));

  vi.doMock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Map()),
  }));

  vi.doMock("next-intl/server", () => ({
    getLocale: vi.fn().mockResolvedValue("fr"),
    getTranslations: vi
      .fn()
      .mockResolvedValue((key: string, vars?: Record<string, unknown>) =>
        vars ? `${key}:${JSON.stringify(vars)}` : key,
      ),
  }));

  vi.doMock("@/config", () => ({
    config: { storageProvider: { maxFileSizeMb: MAX_FILE_SIZE_MB } },
  }));

  return await import("@/app/(default)/(authenticated)/profile/actions");
};

const makeFile = (type: string, sizeBytes = 1024): File => {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], "avatar", { type });
};

describe("uploadAvatar", () => {
  it("rejects when no file is present", async () => {
    const { uploadAvatar } = await setup();

    const result = await uploadAvatar(new FormData());

    expect(result.ok).toBe(false);
    expect(storageUpload).not.toHaveBeenCalled();
    expect(userRepoUpdate).not.toHaveBeenCalled();
  });

  it("rejects an invalid mime type", async () => {
    const { uploadAvatar } = await setup();

    const formData = new FormData();
    formData.set("file", makeFile("application/pdf"));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(false);
    expect(storageUpload).not.toHaveBeenCalled();
    expect(userRepoUpdate).not.toHaveBeenCalled();
  });

  it("rejects a file larger than the configured max size", async () => {
    const { uploadAvatar } = await setup();

    const tooBig = MAX_FILE_SIZE_MB * 1024 * 1024 + 1;
    const formData = new FormData();
    formData.set("file", makeFile("image/png", tooBig));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(false);
    expect(storageUpload).not.toHaveBeenCalled();
    expect(userRepoUpdate).not.toHaveBeenCalled();
  });

  it("uploads a valid file, updates user.image and returns the new url", async () => {
    const { uploadAvatar } = await setup();
    userRepoFindById.mockResolvedValue({ id: USER_ID, image: null });

    const formData = new FormData();
    formData.set("file", makeFile("image/png"));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(true);
    expect(storageUpload).toHaveBeenCalledTimes(1);

    const [uploadedKey, , contentType] = storageUpload.mock.calls[0];
    expect(uploadedKey).toMatch(new RegExp(`^avatars/${USER_ID}/[\\w-]+\\.png$`));
    expect(contentType).toBe("image/png");

    expect(result.data?.url).toBe(`/api/uploads/${uploadedKey}`);
    expect(userRepoUpdate).toHaveBeenCalledWith(USER_ID, { image: `/api/uploads/${uploadedKey}` });
    // Pas d'ancien avatar owned -> aucune suppression best-effort.
    expect(storageDelete).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
  });

  it("best-effort deletes the previous owned avatar on a new upload", async () => {
    const { uploadAvatar } = await setup();
    const previousKey = `avatars/${USER_ID}/old-uuid.png`;
    userRepoFindById.mockResolvedValue({ id: USER_ID, image: `/api/uploads/${previousKey}` });

    const formData = new FormData();
    formData.set("file", makeFile("image/webp"));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(true);
    expect(storageDelete).toHaveBeenCalledWith(previousKey);
  });

  it("does NOT delete an external (EM/OAuth) previous avatar", async () => {
    const { uploadAvatar } = await setup();
    userRepoFindById.mockResolvedValue({
      id: USER_ID,
      image: "https://avatars.githubusercontent.com/u/1?v=4",
    });

    const formData = new FormData();
    formData.set("file", makeFile("image/png"));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(true);
    expect(storageDelete).not.toHaveBeenCalled();
  });

  it("does not fail the upload when deleting the previous avatar throws", async () => {
    const { uploadAvatar } = await setup();
    const previousKey = `avatars/${USER_ID}/old-uuid.png`;
    userRepoFindById.mockResolvedValue({ id: USER_ID, image: `/api/uploads/${previousKey}` });
    storageDelete.mockRejectedValue(new Error("S3 down"));

    const formData = new FormData();
    formData.set("file", makeFile("image/png"));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(true);
    expect(storageDelete).toHaveBeenCalledWith(previousKey);
  });

  it("returns ok:false when the storage upload throws", async () => {
    const { uploadAvatar } = await setup();
    userRepoFindById.mockResolvedValue({ id: USER_ID, image: null });
    storageUpload.mockRejectedValue(new Error("S3 down"));

    const formData = new FormData();
    formData.set("file", makeFile("image/png"));
    const result = await uploadAvatar(formData);

    expect(result.ok).toBe(false);
    expect(userRepoUpdate).not.toHaveBeenCalled();
  });
});

describe("removeAvatar", () => {
  it("sets user.image to null and deletes the previous owned avatar", async () => {
    const { removeAvatar } = await setup();
    const previousKey = `avatars/${USER_ID}/old-uuid.png`;
    userRepoFindById.mockResolvedValue({ id: USER_ID, image: `/api/uploads/${previousKey}` });

    const result = await removeAvatar();

    expect(result.ok).toBe(true);
    expect(userRepoUpdate).toHaveBeenCalledWith(USER_ID, { image: null });
    expect(storageDelete).toHaveBeenCalledWith(previousKey);
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
  });

  it("does NOT delete an external avatar when removing", async () => {
    const { removeAvatar } = await setup();
    userRepoFindById.mockResolvedValue({
      id: USER_ID,
      image: "https://espace-membre.incubateur.net/api/image/foo.jpg",
    });

    const result = await removeAvatar();

    expect(result.ok).toBe(true);
    expect(userRepoUpdate).toHaveBeenCalledWith(USER_ID, { image: null });
    expect(storageDelete).not.toHaveBeenCalled();
  });

  it("still succeeds when storage deletion throws", async () => {
    const { removeAvatar } = await setup();
    const previousKey = `avatars/${USER_ID}/old-uuid.png`;
    userRepoFindById.mockResolvedValue({ id: USER_ID, image: `/api/uploads/${previousKey}` });
    storageDelete.mockRejectedValue(new Error("S3 down"));

    const result = await removeAvatar();

    expect(result.ok).toBe(true);
    expect(userRepoUpdate).toHaveBeenCalledWith(USER_ID, { image: null });
  });
});
