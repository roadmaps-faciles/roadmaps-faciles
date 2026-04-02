/**
 * Tests for ThemeScript dark mode detection logic.
 *
 * The ThemeScript component injects a blocking IIFE that reads localStorage("theme")
 * and prefers-color-scheme to toggle the .dark class on <html> before first paint.
 *
 * We extract the same logic here to test all detection branches.
 */

/** Replicate the ThemeScript detection logic (same as the inline IIFE) */
function detectDarkMode(storedTheme: null | string, prefersDark: boolean): boolean {
  return storedTheme === "dark" || (storedTheme !== "light" && prefersDark);
}

describe("ThemeScript detection logic", () => {
  describe("explicit localStorage values", () => {
    it('returns true when stored theme is "dark"', () => {
      expect(detectDarkMode("dark", false)).toBe(true);
    });

    it('returns true when stored theme is "dark" even if system prefers light', () => {
      expect(detectDarkMode("dark", false)).toBe(true);
    });

    it('returns false when stored theme is "light"', () => {
      expect(detectDarkMode("light", false)).toBe(false);
    });

    it('returns false when stored theme is "light" even if system prefers dark', () => {
      expect(detectDarkMode("light", true)).toBe(false);
    });
  });

  describe("system preference fallback (no stored theme)", () => {
    it("returns true when no stored theme and system prefers dark", () => {
      expect(detectDarkMode(null, true)).toBe(true);
    });

    it("returns false when no stored theme and system prefers light", () => {
      expect(detectDarkMode(null, false)).toBe(false);
    });
  });

  describe("invalid stored values", () => {
    it("falls back to system preference for unrecognized stored value", () => {
      expect(detectDarkMode("invalid", true)).toBe(true);
      expect(detectDarkMode("invalid", false)).toBe(false);
    });

    it("falls back to system preference for empty string", () => {
      expect(detectDarkMode("", true)).toBe(true);
      expect(detectDarkMode("", false)).toBe(false);
    });
  });
});
