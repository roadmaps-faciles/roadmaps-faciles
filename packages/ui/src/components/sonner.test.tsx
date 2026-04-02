import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { toast, Toaster } from "./sonner";

describe("Toaster", () => {
  it("renders without crashing", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeTruthy();
  });

  it("accepts a theme prop", () => {
    const { container } = render(<Toaster theme="dark" />);
    expect(container).toBeTruthy();
  });

  it("re-exports toast function", () => {
    expect(typeof toast).toBe("function");
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof toast.warning).toBe("function");
    expect(typeof toast.info).toBe("function");
    expect(typeof toast.loading).toBe("function");
  });
});
