import { describe, expect, it } from "vitest";

import { ADDON_PACKS, BUNDLE_COMPLETE, BUNDLE_PRO, resolveAddonsForPurchase } from "@/lib/model/Pricing";

describe("resolveAddonsForPurchase", () => {
  it("resolves individual pack to its addons", () => {
    expect(resolveAddonsForPurchase("customDomain")).toEqual(["CUSTOM_DOMAIN", "DNS_MANAGEMENT"]);
    expect(resolveAddonsForPurchase("multiTenant")).toEqual(["MULTI_TENANT"]);
    expect(resolveAddonsForPurchase("analytics")).toEqual(["TRACKING"]);
  });

  it("resolves bundlePro to all addons except SSO", () => {
    const addons = resolveAddonsForPurchase("bundlePro");
    expect(addons).not.toContain("SSO_ENTERPRISE");

    const expectedAddons = ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id)).flatMap(p => p.addons);
    expect(addons).toEqual(expectedAddons);
  });

  it("resolves bundleComplete to all addons including SSO", () => {
    const addons = resolveAddonsForPurchase("bundleComplete");
    expect(addons).toContain("SSO_ENTERPRISE");

    const allAddons = ADDON_PACKS.flatMap(p => p.addons);
    expect(addons).toEqual(allAddons);
  });

  it("returns empty array for unknown ID", () => {
    expect(resolveAddonsForPurchase("nonexistent")).toEqual([]);
  });

  it("bundlePro has strictly fewer addons than bundleComplete", () => {
    const pro = resolveAddonsForPurchase("bundlePro");
    const complete = resolveAddonsForPurchase("bundleComplete");
    expect(pro.length).toBeLessThan(complete.length);
    expect(complete).toEqual(expect.arrayContaining(pro));
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

  it("bundle prices are less than sum of individual packs", () => {
    const proSum = ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id)).reduce((s, p) => s + p.monthlyPrice, 0);
    const allSum = ADDON_PACKS.reduce((s, p) => s + p.monthlyPrice, 0);
    expect(BUNDLE_PRO.monthlyPrice).toBeLessThan(proSum);
    expect(BUNDLE_COMPLETE.monthlyPrice).toBeLessThan(allSum);
  });
});
