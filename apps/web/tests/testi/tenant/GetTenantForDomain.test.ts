import { GetTenantForDomain } from "@/useCases/tenant/GetTenantForDomain";

import { type createMockTenantRepo as CreateMockTenantRepo, createMockTenantRepo, fakeTenant } from "../helpers";

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
    host: "http://localhost:3000",
    brand: { name: "test" },
    appVersionCommit: "test",
  },
}));

describe("GetTenantForDomain", () => {
  let mockTenantRepo: ReturnType<typeof CreateMockTenantRepo>;
  let useCase: GetTenantForDomain;

  beforeEach(() => {
    mockTenantRepo = createMockTenantRepo();
    useCase = new GetTenantForDomain(mockTenantRepo);
    // Clear the global cache between tests
    GetTenantForDomain.revalidate("GetTenantForDomain" as never);
  });

  it("resolves tenant by subdomain", async () => {
    const tenant = fakeTenant({ id: 1 });
    mockTenantRepo.findBySubdomain.mockResolvedValue(tenant);

    const result = await useCase.execute({ domain: "test.localhost:3000" });

    expect(result).toBeDefined();
    expect(mockTenantRepo.findBySubdomain).toHaveBeenCalledWith("test");
  });

  it("resolves tenant by custom domain", async () => {
    const tenant = fakeTenant({ id: 2 });
    mockTenantRepo.findByCustomDomain.mockResolvedValue(tenant);

    const result = await useCase.execute({ domain: "custom.example.com" });

    expect(result).toBeDefined();
    expect(mockTenantRepo.findByCustomDomain).toHaveBeenCalledWith("custom.example.com");
  });

  it("throws when tenant is not found", async () => {
    mockTenantRepo.findBySubdomain.mockResolvedValue(null);

    await expect(useCase.execute({ domain: "missing.localhost:3000" })).rejects.toThrow(
      "Tenant not found for domain: missing.localhost:3000",
    );
  });

  it("caches result on second call", async () => {
    const tenant = fakeTenant({ id: 1 });
    mockTenantRepo.findBySubdomain.mockResolvedValue(tenant);

    await useCase.execute({ domain: "test.localhost:3000" });
    await useCase.execute({ domain: "test.localhost:3000" });

    expect(mockTenantRepo.findBySubdomain).toHaveBeenCalledTimes(1);
  });
});
