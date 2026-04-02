import { getDomainPathname, dirtySafePathname, pathnameDirtyCheck } from "@/utils/dirtyDomain/pathnameDirtyCheck";

vi.mock("@/config", () => ({
  config: {
    rootDomain: "localhost:3000",
  },
}));

describe("getDomainPathname", () => {
  it("extracts the first pathname segment", () => {
    expect(getDomainPathname("/my-domain/some/path")).toBe("/my-domain");
  });

  it("returns empty string for root pathname", () => {
    expect(getDomainPathname("/")).toBe("");
  });

  it("handles single segment", () => {
    expect(getDomainPathname("/segment")).toBe("/segment");
  });

  it("returns empty string for empty pathname", () => {
    expect(getDomainPathname("")).toBe("");
  });
});

describe("pathnameDirtyCheck", () => {
  it("detects domain in pathname", () => {
    expect(pathnameDirtyCheck("/test.localhost:3000/page")).toBe(true);
  });

  it("returns false for clean pathname", () => {
    expect(pathnameDirtyCheck("/clean-path/page")).toBe(false);
  });
});

describe("dirtySafePathname", () => {
  it("returns identity function for clean base", () => {
    const safePath = dirtySafePathname("/clean-base");
    expect(safePath("/page")).toBe("/page");
    expect(safePath("/other")).toBe("/other");
  });

  it("prepends dirty base for dirty domain", () => {
    const safePath = dirtySafePathname("/test.localhost:3000/rest");
    expect(safePath("/page")).toBe("/test.localhost:3000/page");
    expect(safePath("page")).toBe("/test.localhost:3000/page");
  });
});
