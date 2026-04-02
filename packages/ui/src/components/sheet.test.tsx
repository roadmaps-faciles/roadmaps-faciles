import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

describe("Sheet", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Sheet Title")).toBeVisible();
  });

  it("closes on close button click", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Title")).toBeVisible();
    await user.click(screen.getByText("Close"));
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("renders in open state when controlled", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Always Open</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Always Open")).toBeVisible();
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });
});

describe("SheetTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <Sheet>
        <SheetTrigger data-testid="trigger">Open</SheetTrigger>
      </Sheet>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "sheet-trigger");
  });
});

describe("SheetClose", () => {
  it("renders with data-slot", () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
          <SheetClose data-testid="close">Close me</SheetClose>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("close")).toHaveAttribute("data-slot", "sheet-close");
  });
});

describe("SheetHeader", () => {
  it("renders with data-slot", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader data-testid="header">
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "sheet-header");
  });

  it("forwards className", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader data-testid="header" className="custom">
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("header")).toHaveClass("custom");
  });
});

describe("SheetFooter", () => {
  it("renders with data-slot", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
          <SheetFooter data-testid="footer">Footer</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "sheet-footer");
  });
});

describe("SheetTitle", () => {
  it("renders with data-slot", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle data-testid="title">Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "sheet-title");
  });
});

describe("SheetDescription", () => {
  it("renders with data-slot", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription data-testid="desc">Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("desc")).toHaveAttribute("data-slot", "sheet-description");
  });
});

describe("SheetContent sides", () => {
  it("renders with default right side", () => {
    render(
      <Sheet open>
        <SheetContent data-testid="content">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "sheet-content");
  });

  it("renders with left side", () => {
    render(
      <Sheet open>
        <SheetContent side="left" data-testid="content">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
