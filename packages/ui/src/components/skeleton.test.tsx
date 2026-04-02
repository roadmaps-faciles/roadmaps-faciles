import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with data-slot", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute("data-slot", "skeleton");
  });

  it("forwards className", () => {
    render(<Skeleton data-testid="skeleton" className="custom" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("custom");
  });

  it("has animate-pulse class", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("animate-pulse");
  });
});
