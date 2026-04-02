import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("renders with data-slot", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("forwards className", () => {
    render(<Input data-testid="input" className="custom" />);
    expect(screen.getByTestId("input")).toHaveClass("custom");
  });

  it("supports type prop", () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");
  });

  it("supports placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId("input")).toBeDisabled();
  });
});
