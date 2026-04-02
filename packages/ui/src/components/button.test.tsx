import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders with data-slot", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  it("forwards className", () => {
    render(<Button className="custom">Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom");
  });

  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports disabled state", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies default variant", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "default");
  });

  it("applies destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
  });

  it("applies outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");
  });

  it("applies ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");
  });

  it("applies link variant", () => {
    render(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "link");
  });

  it("applies default size", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "default");
  });

  it("applies sm size", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
  });

  it("applies lg size", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("applies icon size", () => {
    render(<Button size="icon">I</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon");
  });

  it("supports asChild", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("exports buttonVariants function", () => {
    const classes = buttonVariants({ variant: "default", size: "default" });
    expect(classes).toContain("inline-flex");
  });
});
