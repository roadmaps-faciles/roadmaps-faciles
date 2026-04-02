import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "./progress";

describe("Progress", () => {
  it("renders with data-slot", () => {
    render(<Progress data-testid="progress" value={50} />);
    expect(screen.getByTestId("progress")).toHaveAttribute("data-slot", "progress");
  });

  it("forwards className", () => {
    render(<Progress data-testid="progress" className="custom" value={50} />);
    expect(screen.getByTestId("progress")).toHaveClass("custom");
  });

  it("renders progressbar role", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders indicator with transform style", () => {
    const { container } = render(<Progress value={75} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ transform: "translateX(-25%)" });
  });

  it("handles zero value", () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: "translateX(-100%)" });
  });

  it("handles 100 value", () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: "translateX(-0%)" });
  });
});
