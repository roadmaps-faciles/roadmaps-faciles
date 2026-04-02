import { describe, expect, it } from "vitest";

/**
 * Tests for the field sync logic used in NewTenantForm.
 * Extracted as pure functions to test without React/RHF overhead.
 */

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Fields {
  name: string;
  organizationName: string;
  organizationSlug: string;
  subdomain: string;
}

type DirtySet = Set<keyof Fields>;

/**
 * Simulate the sync logic from NewTenantForm.
 * Returns the new field values after applying sync rules.
 */
function syncOnNameChange(name: string, current: Fields, dirty: DirtySet): Fields {
  const slug = toSlug(name);
  const next = { ...current, name };

  if (!dirty.has("subdomain")) next.subdomain = slug;
  if (!dirty.has("organizationName")) next.organizationName = name;
  if (!dirty.has("organizationSlug")) next.organizationSlug = slug;

  return next;
}

function syncOnOrgNameChange(orgName: string, current: Fields, dirty: DirtySet): Fields {
  const next = { ...current, organizationName: orgName };

  if (!dirty.has("organizationSlug")) {
    next.organizationSlug = toSlug(orgName);
  }

  return next;
}

describe("toSlug", () => {
  it("converts to lowercase", () => {
    expect(toSlug("Mon Espace")).toBe("mon-espace");
  });

  it("replaces special chars with hyphens", () => {
    expect(toSlug("Café & Croissant")).toBe("caf-croissant");
  });

  it("collapses multiple hyphens", () => {
    expect(toSlug("a--b---c")).toBe("a-b-c");
  });

  it("trims leading/trailing hyphens", () => {
    expect(toSlug("-hello-")).toBe("hello");
  });
});

describe("syncOnNameChange", () => {
  const empty: Fields = { name: "", subdomain: "", organizationName: "", organizationSlug: "" };

  it("syncs all fields when nothing is dirty", () => {
    const dirty: DirtySet = new Set();
    const result = syncOnNameChange("Mon Produit", empty, dirty);

    expect(result.name).toBe("Mon Produit");
    expect(result.subdomain).toBe("mon-produit");
    expect(result.organizationName).toBe("Mon Produit");
    expect(result.organizationSlug).toBe("mon-produit");
  });

  it("does NOT sync subdomain when subdomain is dirty", () => {
    const dirty: DirtySet = new Set(["subdomain"]);
    const current = { ...empty, subdomain: "custom-sub" };
    const result = syncOnNameChange("Mon Produit", current, dirty);

    expect(result.subdomain).toBe("custom-sub");
    expect(result.organizationName).toBe("Mon Produit");
    expect(result.organizationSlug).toBe("mon-produit");
  });

  it("does NOT sync org name when org name is dirty", () => {
    const dirty: DirtySet = new Set(["organizationName"]);
    const current = { ...empty, organizationName: "ACME Corp" };
    const result = syncOnNameChange("Mon Produit", current, dirty);

    expect(result.subdomain).toBe("mon-produit");
    expect(result.organizationName).toBe("ACME Corp");
    expect(result.organizationSlug).toBe("mon-produit");
  });

  it("does NOT sync org slug when org slug is dirty", () => {
    const dirty: DirtySet = new Set(["organizationSlug"]);
    const current = { ...empty, organizationSlug: "acme" };
    const result = syncOnNameChange("Mon Produit", current, dirty);

    expect(result.subdomain).toBe("mon-produit");
    expect(result.organizationName).toBe("Mon Produit");
    expect(result.organizationSlug).toBe("acme");
  });

  it("syncs org slug even when subdomain is dirty", () => {
    const dirty: DirtySet = new Set(["subdomain"]);
    const current = { ...empty, subdomain: "custom" };
    const result = syncOnNameChange("Mon Produit", current, dirty);

    expect(result.subdomain).toBe("custom");
    expect(result.organizationSlug).toBe("mon-produit");
  });
});

describe("syncOnOrgNameChange", () => {
  const base: Fields = { name: "Test", subdomain: "test", organizationName: "Test", organizationSlug: "test" };

  it("syncs org slug when not dirty", () => {
    const dirty: DirtySet = new Set();
    const result = syncOnOrgNameChange("ACME Corp", base, dirty);

    expect(result.organizationName).toBe("ACME Corp");
    expect(result.organizationSlug).toBe("acme-corp");
  });

  it("does NOT sync org slug when dirty", () => {
    const dirty: DirtySet = new Set(["organizationSlug"]);
    const current = { ...base, organizationSlug: "custom" };
    const result = syncOnOrgNameChange("ACME Corp", current, dirty);

    expect(result.organizationName).toBe("ACME Corp");
    expect(result.organizationSlug).toBe("custom");
  });

  it("does NOT touch subdomain", () => {
    const dirty: DirtySet = new Set();
    const result = syncOnOrgNameChange("ACME Corp", base, dirty);

    expect(result.subdomain).toBe("test");
  });
});
