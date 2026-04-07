vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/redis/storage", () => ({ redis: {} }));

import { isAppBotSender } from "@/lib/ee/integration-provider/impl/github/GitHubSyncGuard";

describe("isAppBotSender", () => {
  it("returns true when sender ID matches app bot ID", () => {
    expect(isAppBotSender(123, 123)).toBe(true);
  });

  it("returns false when sender ID differs from app bot ID", () => {
    expect(isAppBotSender(456, 123)).toBe(false);
  });

  it("returns false for zero values that differ", () => {
    expect(isAppBotSender(0, 1)).toBe(false);
  });

  it("returns true for matching zero values", () => {
    expect(isAppBotSender(0, 0)).toBe(true);
  });
});
