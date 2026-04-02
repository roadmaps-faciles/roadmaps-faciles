import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

describe("Switch", () => {
  it("renders with data-slot", () => {
    render(<Switch data-testid="switch" />);
    expect(screen.getByTestId("switch")).toHaveAttribute("data-slot", "switch");
  });

  it("forwards className", () => {
    render(<Switch data-testid="switch" className="custom" />);
    expect(screen.getByTestId("switch")).toHaveClass("custom");
  });

  it("renders as switch role", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("data-state", "unchecked");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "checked");
  });

  it("calls onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("supports disabled state", () => {
    render(<Switch disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("defaults to size=default", () => {
    render(<Switch data-testid="switch" />);
    expect(screen.getByTestId("switch")).toHaveAttribute("data-size", "default");
  });

  it("supports size=sm", () => {
    render(<Switch data-testid="switch" size="sm" />);
    expect(screen.getByTestId("switch")).toHaveAttribute("data-size", "sm");
  });
});
