import { search } from "node-emoji";

describe("node-emoji search — smoke tests", () => {
  it("returns results with correct structure", () => {
    const results = search("smile");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("emoji");
    expect(results[0]).toHaveProperty("name");
    expect(typeof results[0].emoji).toBe("string");
    expect(typeof results[0].name).toBe("string");
  });

  it("finds common shortcodes", () => {
    const names = search("heart").map(r => r.name);

    expect(names).toContain("heart");
  });

  it.each([
    ["smile", "smile"],
    ["sunglasses", "sunglasses"],
    ["fire", "fire"],
    ["rocket", "rocket"],
    ["star", "star"],
    ["wave", "wave"],
    ["100", "100"],
  ])("resolves :%s: shortcode", (query, expectedName) => {
    const results = search(query);
    const names = results.map(r => r.name);

    expect(names).toContain(expectedName);
  });

  it("returns empty array for nonsense query", () => {
    const results = search("xyzzy_nonexistent_emoji_99");

    expect(results).toEqual([]);
  });

  it("handles single character query", () => {
    const results = search("a");

    expect(results.length).toBeGreaterThan(0);
  });

  it("handles empty string query", () => {
    const results = search("");

    expect(results.length).toBeGreaterThan(0);
  });

  it.each(["+", "*", "?", "(", "[", "\\"])("throws on regex-special character %s", char => {
    // node-emoji passes query directly to new RegExp() — known library limitation
    expect(() => search(char)).toThrow();
  });

  it.each([".", "{"])("does not crash on regex character %s (valid in RegExp)", char => {
    expect(() => search(char)).not.toThrow();
  });
});
