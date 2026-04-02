import { cn } from "@roadmaps-faciles/ui";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles falsy values", () => {
    expect(cn("base", false, "visible")).toBe("base visible");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
