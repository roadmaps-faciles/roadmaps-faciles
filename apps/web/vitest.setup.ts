import { vi } from "vitest";

// Mock `server-only` — ce module throw si importé hors RSC
vi.mock("server-only", () => ({}));

// Mock renderEmails — JSX dans .tsx ne parse pas via Rolldown dans les tests unitaires
vi.mock("@/emails/renderEmails", () => ({
  renderInvitationEmail: vi.fn().mockResolvedValue("<html>mock</html>"),
  renderMagicLinkEmail: vi.fn().mockResolvedValue("<html>mock</html>"),
  renderResetPasswordEmail: vi.fn().mockResolvedValue("<html>mock</html>"),
  renderVerifyEmailEmail: vi.fn().mockResolvedValue("<html>mock</html>"),
  renderEmLinkConfirmEmail: vi.fn().mockResolvedValue("<html>mock</html>"),
}));

// Mock du logger pino — éviter les logs en test
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    trace: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));
