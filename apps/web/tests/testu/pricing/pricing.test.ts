import { describe, expect, it } from "vitest";

import { ADDON_PACKS, BUNDLE_COMPLETE, BUNDLE_PRO, resolveAddonsForPurchase } from "@/lib/model/Pricing";

describe("Pricing model", () => {
  describe("ADDON_PACKS", () => {
    it("has 7 packs", () => {
      expect(ADDON_PACKS).toHaveLength(7);
    });

    it("all packs have unique IDs", () => {
      const ids = ADDON_PACKS.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all packs have at least one addon", () => {
      for (const pack of ADDON_PACKS) {
        expect(pack.addons.length).toBeGreaterThan(0);
      }
    });

    it("no addon appears in multiple packs", () => {
      const seen = new Set<string>();
      for (const pack of ADDON_PACKS) {
        for (const addon of pack.addons) {
          expect(seen.has(addon)).toBe(false);
          seen.add(addon);
        }
      }
    });
  });

  describe("Bundles", () => {
    it("BUNDLE_PRO excludes ssoEnterprise", () => {
      expect(BUNDLE_PRO.packs).not.toContain("ssoEnterprise");
      expect(BUNDLE_PRO.packs).toHaveLength(ADDON_PACKS.length - 1);
    });

    it("BUNDLE_COMPLETE includes all packs", () => {
      expect(BUNDLE_COMPLETE.packs).toHaveLength(ADDON_PACKS.length);
    });

    it("Pro price < Complete price", () => {
      expect(BUNDLE_PRO.monthlyPrice).toBeLessThan(BUNDLE_COMPLETE.monthlyPrice);
    });

    it("Bundle prices are less than individual sum", () => {
      const noSsoTotal = ADDON_PACKS.filter(p => p.id !== "ssoEnterprise").reduce((s, p) => s + p.monthlyPrice, 0);
      const allTotal = ADDON_PACKS.reduce((s, p) => s + p.monthlyPrice, 0);
      expect(BUNDLE_PRO.monthlyPrice).toBeLessThan(noSsoTotal);
      expect(BUNDLE_COMPLETE.monthlyPrice).toBeLessThan(allTotal);
    });
  });

  describe("resolveAddonsForPurchase", () => {
    it("resolves a pack to its addons", () => {
      const addons = resolveAddonsForPurchase("customDomain");
      expect(addons).toEqual(["CUSTOM_DOMAIN", "DNS_MANAGEMENT"]);
    });

    it("resolves bundlePro to all addons except SSO", () => {
      const addons = resolveAddonsForPurchase("bundlePro");
      expect(addons).not.toContain("SSO_ENTERPRISE");
      expect(addons.length).toBeGreaterThan(5);
    });

    it("resolves bundleComplete to all addons", () => {
      const addons = resolveAddonsForPurchase("bundleComplete");
      expect(addons).toContain("SSO_ENTERPRISE");
      const allAddons = ADDON_PACKS.flatMap(p => p.addons);
      expect(addons).toHaveLength(allAddons.length);
    });

    it("returns empty for unknown ID", () => {
      expect(resolveAddonsForPurchase("unknown")).toEqual([]);
    });
  });
});
