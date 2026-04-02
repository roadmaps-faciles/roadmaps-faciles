import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with data-slot", () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveAttribute("data-slot", "textarea");
  });

  it("forwards className", () => {
    render(<Textarea data-testid="textarea" className="custom" />);
    expect(screen.getByTestId("textarea")).toHaveClass("custom");
  });

  it("supports placeholder", () => {
    render(<Textarea placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toBeDisabled();
  });
});
