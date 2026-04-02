import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  it("returns false when viewport is wider than 768px", () => {
    vi.stubGlobal("innerWidth", 1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true when viewport is narrower than 768px", () => {
    vi.stubGlobal("innerWidth", 500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false at exactly 768px", () => {
    vi.stubGlobal("innerWidth", 768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true at 767px", () => {
    vi.stubGlobal("innerWidth", 767);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
