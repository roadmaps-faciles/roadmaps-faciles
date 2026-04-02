import { beforeEach, describe, expect, it, vi } from "vitest";

import { fakeOrganization } from "../helpers";

// Mock stripe (both named exports)
const mockStripe = {
  subscriptions: {
    cancel: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/ee/billing/stripe", () => ({
  stripe: mockStripe,
  getStripe: () => mockStripe,
}));

// Mock prisma
const mockPrisma = {
  orgAddon: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  organization: {
    update: vi.fn(),
  },
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock pricing — per-addon price IDs
vi.mock("@/lib/ee/billing/pricing", () => ({
  getPackStripePriceIds: (addon: string) => {
    const prices: Record<string, { monthly: string; yearly: string }> = {
      TRACKING: { monthly: "price_tracking_m", yearly: "price_tracking_y" },
      INTEGRATIONS: { monthly: "price_integrations_m", yearly: "price_integrations_y" },
    };
    return prices[addon] ?? null;
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe("subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateSubscriptionAddons", () => {
    it("adds new addon line items to the subscription", async () => {
      const { updateSubscriptionAddons } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ id: 42, stripeSubscriptionId: "sub_123" });

      // Active addons in DB
      mockPrisma.orgAddon.findMany.mockResolvedValue([{ addon: "TRACKING" }, { addon: "INTEGRATIONS" }]);

      // Current subscription has no items
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: {
          data: [{ id: "si_existing", price: { id: "price_tracking_m", recurring: { interval: "month" } } }],
        },
      });

      await updateSubscriptionAddons(org);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        items: [
          { id: "si_existing" }, // keep existing
          { price: "price_integrations_m", quantity: 1 }, // add new
        ],
      });
    });

    it("removes addon line items when deactivated", async () => {
      const { updateSubscriptionAddons } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ id: 42, stripeSubscriptionId: "sub_123" });

      // Only TRACKING is active now
      mockPrisma.orgAddon.findMany.mockResolvedValue([{ addon: "TRACKING" }]);

      // Subscription has both TRACKING and INTEGRATIONS
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: {
          data: [
            { id: "si_tracking", price: { id: "price_tracking_m", recurring: { interval: "month" } } },
            { id: "si_integrations", price: { id: "price_integrations_m", recurring: { interval: "month" } } },
          ],
        },
      });

      await updateSubscriptionAddons(org);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        items: [
          { id: "si_tracking" }, // keep
          { id: "si_integrations", deleted: true }, // remove
        ],
      });
    });

    it("cancels subscription when all addons are deactivated", async () => {
      const { updateSubscriptionAddons } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ id: 42, stripeSubscriptionId: "sub_123" });

      // No active addons
      mockPrisma.orgAddon.findMany.mockResolvedValue([]);

      // Subscription has one item
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: {
          data: [{ id: "si_tracking", price: { id: "price_tracking_m", recurring: { interval: "month" } } }],
        },
      });

      await updateSubscriptionAddons(org);

      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith("sub_123");
      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: 42 },
        data: { stripeSubscriptionId: null },
      });
    });

    it("does nothing when no stripe subscription exists", async () => {
      const { updateSubscriptionAddons } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ stripeSubscriptionId: null });

      await updateSubscriptionAddons(org);

      expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });
  });

  describe("cancelSubscription", () => {
    it("cancels active subscription at period end", async () => {
      const { cancelSubscription } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ stripeCustomerId: "cus_test_123" });

      mockStripe.subscriptions.list.mockResolvedValue({
        data: [{ id: "sub_active_1" }],
      });

      await cancelSubscription(org);

      expect(mockStripe.subscriptions.list).toHaveBeenCalledWith({
        customer: "cus_test_123",
        status: "active",
        limit: 100,
      });

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith("sub_active_1", {
        cancel_at_period_end: true,
      });
    });

    it("does nothing if org has no stripe customer", async () => {
      const { cancelSubscription } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ stripeCustomerId: null });

      await cancelSubscription(org);

      expect(mockStripe.subscriptions.list).not.toHaveBeenCalled();
    });

    it("does nothing if no active subscriptions found", async () => {
      const { cancelSubscription } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ stripeCustomerId: "cus_test_123" });

      mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

      await cancelSubscription(org);

      expect(mockStripe.subscriptions.update).not.toHaveBeenCalled();
    });
  });

  describe("setPayAsYouWant", () => {
    it("updates pay-as-you-want amount", async () => {
      const { setPayAsYouWant } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ id: 42 });

      await setPayAsYouWant(org, 500);

      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: 42 },
        data: { payAsYouWantCents: 500 },
      });
    });

    it("clamps negative amounts to zero", async () => {
      const { setPayAsYouWant } = await import("@/lib/ee/billing/subscriptions");
      const org = fakeOrganization({ id: 42 });

      await setPayAsYouWant(org, -100);

      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: 42 },
        data: { payAsYouWantCents: 0 },
      });
    });
  });
});
