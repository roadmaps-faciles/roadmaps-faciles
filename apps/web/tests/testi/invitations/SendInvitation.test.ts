import { getEmailTranslations } from "@/emails/getEmailTranslations";
import { SendInvitation } from "@/useCases/invitations/SendInvitation";

import {
  type createMockInvitationRepo as CreateMockInvitationRepo,
  type createMockUserOnTenantRepo as CreateMockUserOnTenantRepo,
  type createMockUserRepo as CreateMockUserRepo,
  createMockInvitationRepo,
  createMockUserOnTenantRepo,
  createMockUserRepo,
  fakeInvitation,
} from "../helpers";

// Mock email sending
const mockSendEmail = vi.fn();
vi.mock("@/lib/mailer", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

// Mock email rendering
vi.mock("@/emails/renderEmails", () => ({
  renderInvitationEmail: vi.fn().mockResolvedValue("<html>invitation</html>"),
}));

// Mock email translations
vi.mock("@/emails/getEmailTranslations", () => ({
  getEmailTranslations: vi.fn().mockResolvedValue({
    subjectOwner: "Invitation owner",
    subjectUser: "Invitation user",
    title: "Title",
    body: "Body {roleText}",
    roleOwner: "owner role",
    button: "Accept",
    ignore: "Ignore",
    footer: "Footer",
  }),
  interpolate: vi.fn((template: string, vars: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] || ""),
  ),
}));

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
    host: "http://localhost:3000",
  },
}));

describe("SendInvitation", () => {
  let mockInvitationRepo: ReturnType<typeof CreateMockInvitationRepo>;
  let mockUserRepo: ReturnType<typeof CreateMockUserRepo>;
  let mockUserOnTenantRepo: ReturnType<typeof CreateMockUserOnTenantRepo>;
  let useCase: SendInvitation;

  const validInput = {
    tenantId: 1,
    email: "new@example.com",
    tenantUrl: "https://tenant.example.com",
    role: "USER" as const,
  };

  beforeEach(() => {
    mockInvitationRepo = createMockInvitationRepo();
    mockUserRepo = createMockUserRepo();
    mockUserOnTenantRepo = createMockUserOnTenantRepo();
    useCase = new SendInvitation(mockInvitationRepo, mockUserRepo, mockUserOnTenantRepo);
    mockSendEmail.mockReset();
    vi.mocked(getEmailTranslations).mockClear();
  });

  it("sends an invitation successfully", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockInvitationRepo.findByEmailAndTenant.mockResolvedValue(null);
    const invitation = fakeInvitation({ tenantId: 1, email: "new@example.com" });
    mockInvitationRepo.create.mockResolvedValue(invitation);
    mockSendEmail.mockResolvedValue(undefined);

    const result = await useCase.execute(validInput);

    expect(result).toEqual(invitation);
    expect(mockInvitationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 1,
        email: "new@example.com",
        role: "USER",
      }),
    );
    expect(mockSendEmail).toHaveBeenCalled();
  });

  it("throws when user is already a member", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: "user-1", status: "ACTIVE" });
    mockUserOnTenantRepo.findMembership.mockResolvedValue({ status: "ACTIVE" });

    await expect(useCase.execute(validInput)).rejects.toThrow("Cet utilisateur est déjà membre de ce tenant.");
  });

  it("throws when user is blocked globally", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: "user-1", status: "BLOCKED" });

    await expect(useCase.execute(validInput)).rejects.toThrow("Cet utilisateur est bloqué ou supprimé.");
  });

  it("throws when user is deleted globally", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: "user-1", status: "DELETED" });

    await expect(useCase.execute(validInput)).rejects.toThrow("Cet utilisateur est bloqué ou supprimé.");
  });

  it("throws when user is blocked on tenant", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: "user-1", status: "ACTIVE" });
    mockUserOnTenantRepo.findMembership.mockResolvedValue({ status: "BLOCKED" });

    await expect(useCase.execute(validInput)).rejects.toThrow("Cet utilisateur est bloqué sur ce tenant.");
  });

  it("throws when a pending invitation already exists", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockInvitationRepo.findByEmailAndTenant.mockResolvedValue(fakeInvitation({ acceptedAt: null }));

    await expect(useCase.execute(validInput)).rejects.toThrow(
      "Une invitation est déjà en attente pour cet utilisateur.",
    );
  });

  it("replaces a previously accepted invitation", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockInvitationRepo.findByEmailAndTenant.mockResolvedValue(fakeInvitation({ id: 42, acceptedAt: new Date() }));
    mockInvitationRepo.delete.mockResolvedValue(undefined);
    const newInvitation = fakeInvitation({ tenantId: 1 });
    mockInvitationRepo.create.mockResolvedValue(newInvitation);
    mockSendEmail.mockResolvedValue(undefined);

    const result = await useCase.execute(validInput);

    expect(mockInvitationRepo.delete).toHaveBeenCalledWith(42);
    expect(result).toEqual(newInvitation);
  });

  it("uses provided locale for email translations", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockInvitationRepo.findByEmailAndTenant.mockResolvedValue(null);
    mockInvitationRepo.create.mockResolvedValue(fakeInvitation());
    mockSendEmail.mockResolvedValue(undefined);

    await useCase.execute({ ...validInput, locale: "en" });

    // Both calls (invitation namespace + footer) must use the provided locale
    expect(getEmailTranslations).toHaveBeenCalledTimes(2);
    expect(getEmailTranslations).toHaveBeenNthCalledWith(1, "en", expect.any(String), expect.any(Array));
    expect(getEmailTranslations).toHaveBeenNthCalledWith(2, "en", expect.any(String), expect.any(Array));
  });

  it("defaults to French locale when not provided", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockInvitationRepo.findByEmailAndTenant.mockResolvedValue(null);
    mockInvitationRepo.create.mockResolvedValue(fakeInvitation());
    mockSendEmail.mockResolvedValue(undefined);

    await useCase.execute(validInput);

    expect(getEmailTranslations).toHaveBeenCalledTimes(2);
    expect(getEmailTranslations).toHaveBeenNthCalledWith(1, "fr", expect.any(String), expect.any(Array));
    expect(getEmailTranslations).toHaveBeenNthCalledWith(2, "fr", expect.any(String), expect.any(Array));
  });
});
