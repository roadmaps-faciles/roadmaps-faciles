import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders with data-slot", () => {
    render(<Alert>Content</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("data-slot", "alert");
  });

  it("forwards className", () => {
    render(<Alert className="custom">Content</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("custom");
  });

  it("has role=alert", () => {
    render(<Alert>Content</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Alert>Default</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("bg-card");
  });

  it("applies destructive variant classes", () => {
    render(<Alert variant="destructive">Error</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("text-destructive");
  });

  it("applies success variant classes", () => {
    render(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("text-success");
  });

  it("applies warning variant classes", () => {
    render(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("text-warning");
  });
});

describe("AlertTitle", () => {
  it("renders with data-slot", () => {
    render(<AlertTitle data-testid="title">Title</AlertTitle>);
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "alert-title");
  });

  it("forwards className", () => {
    render(
      <AlertTitle data-testid="title" className="custom">
        Title
      </AlertTitle>,
    );
    expect(screen.getByTestId("title")).toHaveClass("custom");
  });

  it("renders children", () => {
    render(<AlertTitle>My Title</AlertTitle>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });
});

describe("AlertDescription", () => {
  it("renders with data-slot", () => {
    render(<AlertDescription data-testid="desc">Description</AlertDescription>);
    expect(screen.getByTestId("desc")).toHaveAttribute("data-slot", "alert-description");
  });

  it("forwards className", () => {
    render(
      <AlertDescription data-testid="desc" className="custom">
        Description
      </AlertDescription>,
    );
    expect(screen.getByTestId("desc")).toHaveClass("custom");
  });
});
