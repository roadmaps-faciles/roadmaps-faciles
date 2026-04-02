import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Item 1")).toBeVisible();
    expect(screen.getByText("Item 2")).toBeVisible();
  });

  it("closes on escape", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Item")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Item")).not.toBeInTheDocument();
  });

  it("calls onSelect on item click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Click me</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByText("Open"));
    await user.click(screen.getByText("Click me"));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("DropdownMenuTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Open</DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "dropdown-menu-trigger");
  });
});

describe("DropdownMenuItem", () => {
  it("renders with data-slot when open", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="item">Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "dropdown-menu-item");
  });

  it("supports destructive variant", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="item" variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "destructive");
  });

  it("supports inset", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="item" inset>
            Inset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("item")).toHaveAttribute("data-inset", "true");
  });
});

describe("DropdownMenuLabel", () => {
  it("renders with data-slot", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel data-testid="label">Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("label")).toHaveAttribute("data-slot", "dropdown-menu-label");
  });
});

describe("DropdownMenuSeparator", () => {
  it("renders with data-slot", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator data-testid="separator" />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("separator")).toHaveAttribute("data-slot", "dropdown-menu-separator");
  });
});

describe("DropdownMenuShortcut", () => {
  it("renders with data-slot", () => {
    render(<DropdownMenuShortcut data-testid="shortcut">Ctrl+K</DropdownMenuShortcut>);
    expect(screen.getByTestId("shortcut")).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
  });

  it("renders shortcut text", () => {
    render(<DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>);
    expect(screen.getByText("Ctrl+K")).toBeInTheDocument();
  });
});

describe("DropdownMenuGroup", () => {
  it("renders with data-slot", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup data-testid="group">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("group")).toHaveAttribute("data-slot", "dropdown-menu-group");
  });
});

describe("DropdownMenuCheckboxItem", () => {
  it("renders with data-slot", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem data-testid="checkbox" checked>
            Checked Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("checkbox")).toHaveAttribute("data-slot", "dropdown-menu-checkbox-item");
  });
});

describe("DropdownMenuRadioGroup + RadioItem", () => {
  it("renders radio items", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup data-testid="radio-group" value="a">
            <DropdownMenuRadioItem data-testid="radio-a" value="a">
              Option A
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem data-testid="radio-b" value="b">
              Option B
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    expect(screen.getByTestId("radio-group")).toHaveAttribute("data-slot", "dropdown-menu-radio-group");
    expect(screen.getByTestId("radio-a")).toHaveAttribute("data-slot", "dropdown-menu-radio-item");
  });
});
