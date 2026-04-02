vi.mock("server-only", () => ({}));

const mockTrack = vi.fn();
const mockIdentify = vi.fn();
const mockGroupIdentify = vi.fn();
const mockShutdown = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/ee/tracking-provider/serverFactory", () => ({
  getServerTrackingProvider: vi.fn().mockResolvedValue({
    track: (...args: unknown[]) => mockTrack(...args),
    identify: (...args: unknown[]) => mockIdentify(...args),
    groupIdentify: (...args: unknown[]) => mockGroupIdentify(...args),
    shutdown: () => mockShutdown(),
  }),
}));

describe("serverTracking helpers", () => {
  let trackServerEvent: typeof import("@/lib/ee/tracking-provider/serverTracking").trackServerEvent;
  let identifyServerUser: typeof import("@/lib/ee/tracking-provider/serverTracking").identifyServerUser;
  let identifyServerGroup: typeof import("@/lib/ee/tracking-provider/serverTracking").identifyServerGroup;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/lib/ee/tracking-provider/serverTracking");
    trackServerEvent = mod.trackServerEvent;
    identifyServerUser = mod.identifyServerUser;
    identifyServerGroup = mod.identifyServerGroup;
  });

  it("trackServerEvent delegates to provider.track", async () => {
    const event = { name: "post.created", properties: { postId: "1" } };
    await trackServerEvent("user-1", event);
    expect(mockTrack).toHaveBeenCalledWith("user-1", event);
  });

  it("identifyServerUser delegates to provider.identify", async () => {
    const traits = { email: "test@test.com", name: "Test" };
    await identifyServerUser("user-1", traits);
    expect(mockIdentify).toHaveBeenCalledWith("user-1", traits);
  });

  it("identifyServerGroup delegates to provider.groupIdentify", async () => {
    const traits = { name: "Acme", subdomain: "acme" };
    await identifyServerGroup("tenant", "42", traits);
    expect(mockGroupIdentify).toHaveBeenCalledWith("tenant", "42", traits);
  });

  it("trackServerEvent does not throw when called with minimal event", async () => {
    await expect(trackServerEvent("u1", { name: "test" })).resolves.toBeUndefined();
  });
});
