import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Dialog Title")).toBeVisible();
    expect(screen.getByText("Dialog Description")).toBeVisible();
  });

  it("closes on close button click", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Title")).toBeVisible();
    await user.click(screen.getByText("Close"));
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("renders in open state when controlled", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Always Open</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Always Open")).toBeVisible();
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });
});

describe("DialogTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="trigger">Open</DialogTrigger>
      </Dialog>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "dialog-trigger");
  });
});

describe("DialogHeader", () => {
  it("renders with data-slot", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "dialog-header");
  });

  it("forwards className", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header" className="custom">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("header")).toHaveClass("custom");
  });
});

describe("DialogFooter", () => {
  it("renders with data-slot", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogFooter data-testid="footer">Footer content</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "dialog-footer");
  });

  it("renders close button in footer when showCloseButton=true", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogFooter showCloseButton>Actions</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});

describe("DialogTitle", () => {
  it("renders with data-slot", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle data-testid="title">My Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "dialog-title");
  });
});

describe("DialogDescription", () => {
  it("renders with data-slot", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription data-testid="desc">My description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("desc")).toHaveAttribute("data-slot", "dialog-description");
  });
});

describe("DialogClose", () => {
  it("renders with data-slot", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogClose data-testid="close">Close me</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("close")).toHaveAttribute("data-slot", "dialog-close");
  });

  it("closes dialog on click", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogClose>Close me</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Title")).toBeVisible();
    await user.click(screen.getByText("Close me"));
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });
});
