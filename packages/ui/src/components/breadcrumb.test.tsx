import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  it("renders with data-slot", () => {
    render(<Breadcrumb data-testid="breadcrumb" />);
    expect(screen.getByTestId("breadcrumb")).toHaveAttribute("data-slot", "breadcrumb");
  });

  it("has aria-label breadcrumb", () => {
    render(<Breadcrumb data-testid="breadcrumb" />);
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
  });

  it("renders as nav element", () => {
    render(<Breadcrumb data-testid="breadcrumb" />);
    expect(screen.getByTestId("breadcrumb").tagName).toBe("NAV");
  });
});

describe("BreadcrumbList", () => {
  it("renders with data-slot", () => {
    render(<BreadcrumbList data-testid="list" />);
    expect(screen.getByTestId("list")).toHaveAttribute("data-slot", "breadcrumb-list");
  });

  it("forwards className", () => {
    render(<BreadcrumbList data-testid="list" className="custom" />);
    expect(screen.getByTestId("list")).toHaveClass("custom");
  });
});

describe("BreadcrumbItem", () => {
  it("renders with data-slot", () => {
    render(<BreadcrumbItem data-testid="item">Item</BreadcrumbItem>);
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "breadcrumb-item");
  });
});

describe("BreadcrumbLink", () => {
  it("renders with data-slot", () => {
    render(<BreadcrumbLink data-testid="link">Link</BreadcrumbLink>);
    expect(screen.getByTestId("link")).toHaveAttribute("data-slot", "breadcrumb-link");
  });

  it("renders as anchor by default", () => {
    render(
      <BreadcrumbLink href="/test" data-testid="link">
        Link
      </BreadcrumbLink>,
    );
    expect(screen.getByTestId("link").tagName).toBe("A");
  });

  it("supports asChild", () => {
    render(
      <BreadcrumbLink asChild>
        <button type="button">Custom</button>
      </BreadcrumbLink>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "breadcrumb-link");
  });
});

describe("BreadcrumbPage", () => {
  it("renders with data-slot", () => {
    render(<BreadcrumbPage data-testid="page">Current</BreadcrumbPage>);
    expect(screen.getByTestId("page")).toHaveAttribute("data-slot", "breadcrumb-page");
  });

  it("has aria-current=page", () => {
    render(<BreadcrumbPage data-testid="page">Current</BreadcrumbPage>);
    expect(screen.getByTestId("page")).toHaveAttribute("aria-current", "page");
  });
});

describe("BreadcrumbSeparator", () => {
  it("renders with data-slot", () => {
    render(<BreadcrumbSeparator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("data-slot", "breadcrumb-separator");
  });

  it("is aria-hidden", () => {
    render(<BreadcrumbSeparator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders custom children", () => {
    render(<BreadcrumbSeparator>/</BreadcrumbSeparator>);
    expect(screen.getByText("/")).toBeInTheDocument();
  });
});

describe("BreadcrumbEllipsis", () => {
  it("renders with data-slot", () => {
    render(<BreadcrumbEllipsis data-testid="ellipsis" />);
    expect(screen.getByTestId("ellipsis")).toHaveAttribute("data-slot", "breadcrumb-ellipsis");
  });

  it("has sr-only text More", () => {
    render(<BreadcrumbEllipsis />);
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});

describe("Breadcrumb composition", () => {
  it("renders full breadcrumb structure", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });
});
