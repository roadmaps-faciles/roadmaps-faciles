import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders with data-slot", () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId("checkbox")).toHaveAttribute("data-slot", "checkbox");
  });

  it("forwards className", () => {
    render(<Checkbox data-testid="checkbox" className="custom" />);
    expect(screen.getByTestId("checkbox")).toHaveClass("custom");
  });

  it("renders as a button role", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("calls onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("supports disabled state", () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("supports controlled checked state", () => {
    render(<Checkbox checked />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "checked");
  });
});
