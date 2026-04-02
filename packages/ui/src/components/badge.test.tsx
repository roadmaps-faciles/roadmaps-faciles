import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders with data-slot", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toHaveAttribute("data-slot", "badge");
  });

  it("forwards className", () => {
    render(<Badge className="custom">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("custom");
  });

  it("renders children", () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveAttribute("data-variant", "default");
  });

  it("applies secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveAttribute("data-variant", "secondary");
  });

  it("applies destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveAttribute("data-variant", "destructive");
  });

  it("applies outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveAttribute("data-variant", "outline");
  });

  it("applies success variant", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveAttribute("data-variant", "success");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toHaveAttribute("data-variant", "warning");
  });

  it("supports asChild", () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("data-slot", "badge");
  });

  it("exports badgeVariants function", () => {
    const classes = badgeVariants({ variant: "default" });
    expect(classes).toContain("inline-flex");
  });
});
