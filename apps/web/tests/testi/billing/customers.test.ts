import { beforeEach, describe, expect, it, vi } from "vitest";

import { fakeOrganization } from "../helpers";

// Mock getStripe
const mockStripe = {
  customers: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/ee/billing/stripe", () => ({
  getStripe: () => mockStripe,
}));

// Mock prisma
const mockPrisma = {
  organization: {
    update: vi.fn(),
  },
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: mockPrisma,
}));

describe("customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createStripeCustomer", () => {
    it("creates a stripe customer with org metadata", async () => {
      const { createStripeCustomer } = await import("@/lib/ee/billing/customers");
      const org = fakeOrganization({ id: 42, name: "Test Corp", slug: "test-corp" });

      mockStripe.customers.create.mockResolvedValue({ id: "cus_new_123" });

      const result = await createStripeCustomer(org);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        name: "Test Corp",
        metadata: { orgId: "42", orgSlug: "test-corp" },
      });
      expect(result).toBe("cus_new_123");
    });
  });

  describe("syncStripeCustomer", () => {
    it("updates existing customer metadata", async () => {
      const { syncStripeCustomer } = await import("@/lib/ee/billing/customers");
      const org = fakeOrganization({
        id: 42,
        name: "Updated Corp",
        slug: "updated-corp",
        stripeCustomerId: "cus_existing_123",
      });

      await syncStripeCustomer(org);

      expect(mockStripe.customers.update).toHaveBeenCalledWith("cus_existing_123", {
        name: "Updated Corp",
        metadata: { orgId: "42", orgSlug: "updated-corp" },
      });
    });

    it("does nothing if org has no stripe customer", async () => {
      const { syncStripeCustomer } = await import("@/lib/ee/billing/customers");
      const org = fakeOrganization({ stripeCustomerId: null });

      await syncStripeCustomer(org);

      expect(mockStripe.customers.update).not.toHaveBeenCalled();
    });
  });

  describe("getOrCreateCustomer", () => {
    it("returns existing customer ID if org already has one", async () => {
      const { getOrCreateCustomer } = await import("@/lib/ee/billing/customers");
      const org = fakeOrganization({ stripeCustomerId: "cus_existing_123" });

      const result = await getOrCreateCustomer(org);

      expect(result).toBe("cus_existing_123");
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
    });

    it("creates new customer if org has no stripe customer", async () => {
      const { getOrCreateCustomer } = await import("@/lib/ee/billing/customers");
      const org = fakeOrganization({ stripeCustomerId: null, id: 42, name: "New Corp", slug: "new-corp" });

      mockStripe.customers.create.mockResolvedValue({ id: "cus_new_456" });

      const result = await getOrCreateCustomer(org);

      expect(result).toBe("cus_new_456");
      expect(mockStripe.customers.create).toHaveBeenCalled();
    });
  });
});
