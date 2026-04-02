import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("renders with data-slot", () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toHaveAttribute("data-slot", "separator");
  });

  it("forwards className", () => {
    render(<Separator data-testid="separator" className="custom" />);
    expect(screen.getByTestId("separator")).toHaveClass("custom");
  });

  it("defaults to horizontal orientation", () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("supports vertical orientation", () => {
    render(<Separator data-testid="separator" orientation="vertical" />);
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "vertical");
  });

  it("is decorative by default", () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toHaveAttribute("role", "none");
  });
});
