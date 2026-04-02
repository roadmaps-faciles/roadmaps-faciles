import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  it("renders with data-slot", () => {
    render(<Label data-testid="label">Name</Label>);
    expect(screen.getByTestId("label")).toHaveAttribute("data-slot", "label");
  });

  it("forwards className", () => {
    render(
      <Label data-testid="label" className="custom">
        Name
      </Label>,
    );
    expect(screen.getByTestId("label")).toHaveClass("custom");
  });

  it("renders children", () => {
    render(<Label>Email address</Label>);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("supports htmlFor prop", () => {
    render(<Label htmlFor="email">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });
});
