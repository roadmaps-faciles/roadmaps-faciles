import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

describe("Pagination", () => {
  it("renders with data-slot", () => {
    render(
      <Pagination data-testid="pagination">
        <PaginationContent />
      </Pagination>,
    );
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-slot", "pagination");
  });

  it("has navigation role", () => {
    render(
      <Pagination>
        <PaginationContent />
      </Pagination>,
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has aria-label pagination", () => {
    render(
      <Pagination>
        <PaginationContent />
      </Pagination>,
    );
    expect(screen.getByLabelText("pagination")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(
      <Pagination data-testid="pagination" className="custom">
        <PaginationContent />
      </Pagination>,
    );
    expect(screen.getByTestId("pagination")).toHaveClass("custom");
  });
});

describe("PaginationContent", () => {
  it("renders with data-slot", () => {
    render(
      <Pagination>
        <PaginationContent data-testid="content" />
      </Pagination>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "pagination-content");
  });
});

describe("PaginationItem", () => {
  it("renders with data-slot", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem data-testid="item">
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "pagination-item");
  });
});

describe("PaginationLink", () => {
  it("renders with data-slot", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink data-testid="link" href="#">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByTestId("link")).toHaveAttribute("data-slot", "pagination-link");
  });

  it("marks active page", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink data-testid="link" isActive href="#">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByTestId("link")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("link")).toHaveAttribute("data-active", "true");
  });

  it("applies ghost variant when not active", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink data-testid="link" href="#">
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const link = screen.getByTestId("link");
    expect(link).not.toHaveAttribute("aria-current");
  });
});

describe("PaginationPrevious", () => {
  it("has aria-label", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
  });
});

describe("PaginationNext", () => {
  it("has aria-label", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
  });
});

describe("PaginationEllipsis", () => {
  it("renders with data-slot", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis data-testid="ellipsis" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByTestId("ellipsis")).toHaveAttribute("data-slot", "pagination-ellipsis");
  });

  it("has sr-only text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });
});
