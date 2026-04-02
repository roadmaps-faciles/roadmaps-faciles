import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";

describe("Table", () => {
  it("renders with data-slot", () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("table")).toHaveAttribute("data-slot", "table");
  });

  it("forwards className", () => {
    render(
      <Table data-testid="table" className="custom">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("table")).toHaveClass("custom");
  });

  it("wraps in a scrollable container", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("data-slot", "table-container");
  });
});

describe("TableHeader", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableHeader data-testid="header">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "table-header");
  });
});

describe("TableBody", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableBody data-testid="body">
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("body")).toHaveAttribute("data-slot", "table-body");
  });
});

describe("TableFooter", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter data-testid="footer">
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "table-footer");
  });
});

describe("TableRow", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("row")).toHaveAttribute("data-slot", "table-row");
  });

  it("forwards className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row" className="custom">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("row")).toHaveClass("custom");
  });
});

describe("TableHead", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="head">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("head")).toHaveAttribute("data-slot", "table-head");
  });
});

describe("TableCell", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell">Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("cell")).toHaveAttribute("data-slot", "table-cell");
  });

  it("forwards className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell" className="custom">
              Content
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("cell")).toHaveClass("custom");
  });
});

describe("TableCaption", () => {
  it("renders with data-slot", () => {
    render(
      <Table>
        <TableCaption data-testid="caption">Caption text</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("caption")).toHaveAttribute("data-slot", "table-caption");
  });

  it("renders caption text", () => {
    render(
      <Table>
        <TableCaption>A list of items</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("A list of items")).toBeInTheDocument();
  });
});

describe("Table composition", () => {
  it("renders a complete table", () => {
    render(
      <Table>
        <TableCaption>Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });
});
