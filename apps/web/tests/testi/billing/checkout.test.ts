import { beforeEach, describe, expect, it, vi } from "vitest";

import { fakeOrganization } from "../helpers";

// Mock stripe (both named exports needed)
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
};

vi.mock("@/lib/ee/billing/stripe", () => ({
  stripe: mockStripe,
  getStripe: () => mockStripe,
}));

// Mock getOrCreateCustomer
vi.mock("@/lib/ee/billing/customers", () => ({
  getOrCreateCustomer: vi.fn().mockResolvedValue("cus_test_123"),
}));

// Mock pricing - per-pack price IDs
vi.mock("@/lib/ee/billing/pricing", () => ({
  getPackStripePriceIds: (packId: string) => {
    const prices: Record<string, { monthly: string; yearly: string }> = {
      analytics: { monthly: "price_tracking_m", yearly: "price_tracking_y" },
      integrations: { monthly: "price_integrations_m", yearly: "price_integrations_y" },
      multiTenant: { monthly: "price_multi_tenant_m", yearly: "price_multi_tenant_y" },
    };
    return prices[packId] ?? null;
  },
}));

// Mock config
vi.mock("@/config", () => ({
  config: {
    host: "http://localhost:3000",
  },
}));

describe("checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPackCheckoutSession", () => {
    it("creates a checkout session with pack price", async () => {
      const { createPackCheckoutSession } = await import("@/lib/ee/billing/checkout");
      const org = fakeOrganization({ id: 42, slug: "test-org" });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        url: "https://checkout.stripe.com/session",
      });

      const result = await createPackCheckoutSession(
        org,
        "analytics",
        "https://example.com/success",
        "https://example.com/cancel",
      );

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_test_123",
          mode: "subscription",
          line_items: [{ price: "price_tracking_m", quantity: 1 }],
          metadata: expect.objectContaining({ purchaseId: "analytics", orgId: "42" }),
        }),
      );

      expect(result.url).toBe("https://checkout.stripe.com/session");
    });

    it("creates a yearly checkout session", async () => {
      const { createPackCheckoutSession } = await import("@/lib/ee/billing/checkout");
      const org = fakeOrganization({ id: 42, slug: "test-org" });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        url: "https://checkout.stripe.com/session",
      });

      await createPackCheckoutSession(
        org,
        "analytics",
        "https://example.com/success",
        "https://example.com/cancel",
        "yearly",
      );

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: "price_tracking_y", quantity: 1 }],
        }),
      );
    });

    it("throws for unknown purchase ID", async () => {
      const { createPackCheckoutSession } = await import("@/lib/ee/billing/checkout");
      const org = fakeOrganization({ id: 42, slug: "test-org" });

      await expect(
        createPackCheckoutSession(
          org,
          "unknownPack" as never,
          "https://example.com/success",
          "https://example.com/cancel",
        ),
      ).rejects.toThrow("Unknown purchase ID");
    });
  });

  describe("createPortalSession", () => {
    it("creates a portal session for org with stripe customer", async () => {
      const { createPortalSession } = await import("@/lib/ee/billing/checkout");
      const org = fakeOrganization({ stripeCustomerId: "cus_existing_123" });

      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        id: "bps_test_123",
        url: "https://billing.stripe.com/session",
      });

      const result = await createPortalSession(org, "https://example.com/billing");

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: "cus_existing_123",
        return_url: "https://example.com/billing",
      });

      expect(result.url).toBe("https://billing.stripe.com/session");
    });

    it("throws if org has no stripe customer", async () => {
      const { createPortalSession } = await import("@/lib/ee/billing/checkout");
      const org = fakeOrganization({ stripeCustomerId: null });

      await expect(createPortalSession(org, "https://example.com/billing")).rejects.toThrow(
        "Organization has no Stripe customer",
      );
    });
  });
});
