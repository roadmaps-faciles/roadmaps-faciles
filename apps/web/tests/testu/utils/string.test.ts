import { escapeStringRegexp, isFalsy, isTruthy, slugify } from "@/utils/string";

describe("isTruthy", () => {
  it.each(["yes", "YES", "Yes", "true", "TRUE", "True", "1"])('returns true for "%s"', value => {
    expect(isTruthy(value)).toBe(true);
  });

  it.each([undefined, "", "no", "false", "0", "random", "2"])("returns false for %s", value => {
    expect(isTruthy(value)).toBe(false);
  });
});

describe("isFalsy", () => {
  it.each(["no", "NO", "No", "false", "FALSE", "False", "0"])('returns true for "%s"', value => {
    expect(isFalsy(value)).toBe(true);
  });

  it("returns true for undefined", () => {
    expect(isFalsy(undefined)).toBe(true);
  });

  it("returns true for empty string", () => {
    expect(isFalsy("")).toBe(true);
  });

  it.each(["yes", "true", "1", "random"])('returns false for "%s"', value => {
    expect(isFalsy(value)).toBe(false);
  });
});

describe("escapeStringRegexp", () => {
  it.each(["|", "\\", "{", "}", "(", ")", "[", "]", "^", "$", "+", "*", "?", "."])(
    "escapes special character %s",
    char => {
      const escaped = escapeStringRegexp(char);
      const regex = new RegExp(escaped);
      expect(regex.test(char)).toBe(true);
    },
  );

  it("escapes hyphen", () => {
    const escaped = escapeStringRegexp("-");
    const regex = new RegExp(escaped);
    expect(regex.test("-")).toBe(true);
  });

  it("escapes a complex string with multiple special characters", () => {
    const input = "hello.world (test) [1+2*3]";
    const escaped = escapeStringRegexp(input);
    const regex = new RegExp(escaped);
    expect(regex.test(input)).toBe(true);
    expect(regex.test("helloXworld")).toBe(false);
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces accented characters", () => {
    expect(slugify("café crème")).toBe("caf-cr-me");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("hello@world!foo")).toBe("hello-world-foo");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("collapses multiple separators", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});
