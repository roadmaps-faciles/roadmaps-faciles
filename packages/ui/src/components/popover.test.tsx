import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Popover content")).toBeVisible();
  });

  it("closes on escape", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Content")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders in open state when controlled", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Always visible</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Always visible")).toBeVisible();
  });
});

describe("PopoverTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <Popover>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
      </Popover>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "popover-trigger");
  });
});

describe("PopoverContent", () => {
  it("renders with data-slot", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="content">Content</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "popover-content");
  });

  it("forwards className", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="content" className="custom">
          Content
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("content")).toHaveClass("custom");
  });
});

describe("PopoverAnchor", () => {
  it("renders with data-slot", () => {
    render(
      <Popover>
        <PopoverAnchor data-testid="anchor">Anchor</PopoverAnchor>
      </Popover>,
    );
    expect(screen.getByTestId("anchor")).toHaveAttribute("data-slot", "popover-anchor");
  });
});
