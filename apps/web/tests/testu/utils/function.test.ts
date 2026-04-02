import { ensure } from "@/utils/function";

describe("ensure", () => {
  it("returns the callback result on success", () => {
    const result = ensure(() => 42, 0);
    expect(result).toBe(42);
  });

  it("returns fallback when callback throws (all errors silenced by default)", () => {
    const result = ensure((): string => {
      throw new Error("boom");
    }, "fallback");
    expect(result).toBe("fallback");
  });

  it("returns fallback when callback throws a matching silenced error", () => {
    const result = ensure(
      (): string => {
        throw new TypeError("type error");
      },
      "fallback",
      TypeError,
    );
    expect(result).toBe("fallback");
  });

  it("rethrows when error does not match silenced errors", () => {
    expect(() =>
      ensure(
        (): string => {
          throw new RangeError("range error");
        },
        "fallback",
        TypeError,
      ),
    ).toThrow(RangeError);
  });

  it("returns fallback value of the correct type", () => {
    const result = ensure(
      (): { default: boolean } => {
        throw new Error("fail");
      },
      { default: true },
    );
    expect(result).toEqual({ default: true });
  });
});
