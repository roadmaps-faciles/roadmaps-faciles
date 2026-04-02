import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("renders with data-slot", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
  });

  it("forwards className", () => {
    render(
      <Card data-testid="card" className="custom">
        Content
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("custom");
  });

  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});

describe("CardHeader", () => {
  it("renders with data-slot", () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "card-header");
  });

  it("forwards className", () => {
    render(
      <CardHeader data-testid="header" className="custom">
        Header
      </CardHeader>,
    );
    expect(screen.getByTestId("header")).toHaveClass("custom");
  });
});

describe("CardTitle", () => {
  it("renders with data-slot", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "card-title");
  });

  it("forwards className", () => {
    render(
      <CardTitle data-testid="title" className="custom">
        Title
      </CardTitle>,
    );
    expect(screen.getByTestId("title")).toHaveClass("custom");
  });
});

describe("CardDescription", () => {
  it("renders with data-slot", () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    expect(screen.getByTestId("desc")).toHaveAttribute("data-slot", "card-description");
  });
});

describe("CardAction", () => {
  it("renders with data-slot", () => {
    render(<CardAction data-testid="action">Action</CardAction>);
    expect(screen.getByTestId("action")).toHaveAttribute("data-slot", "card-action");
  });
});

describe("CardContent", () => {
  it("renders with data-slot", () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "card-content");
  });

  it("forwards className", () => {
    render(
      <CardContent data-testid="content" className="custom">
        Content
      </CardContent>,
    );
    expect(screen.getByTestId("content")).toHaveClass("custom");
  });
});

describe("CardFooter", () => {
  it("renders with data-slot", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "card-footer");
  });

  it("forwards className", () => {
    render(
      <CardFooter data-testid="footer" className="custom">
        Footer
      </CardFooter>,
    );
    expect(screen.getByTestId("footer")).toHaveClass("custom");
  });
});

describe("Card composition", () => {
  it("renders full card structure", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
