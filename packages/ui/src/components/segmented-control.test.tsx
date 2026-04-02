import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

describe("SegmentedControl", () => {
  it("renders items", () => {
    render(
      <SegmentedControl value="a">
        <SegmentedControlItem value="a">Option A</SegmentedControlItem>
        <SegmentedControlItem value="b">Option B</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("marks the active item with data-state=on", () => {
    render(
      <SegmentedControl value="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(screen.getByText("A")).toHaveAttribute("data-state", "on");
    expect(screen.getByText("B")).toHaveAttribute("data-state", "off");
  });

  it("calls onValueChange when clicking an item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl value="a" onValueChange={onChange}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByText("B"));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("does not call onValueChange on disabled item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl value="a" onValueChange={onChange}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>
          B
        </SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByText("B"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies data-slot attributes", () => {
    render(
      <SegmentedControl value="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(screen.getByText("A").closest("[data-slot='segmented-control']")).toBeInTheDocument();
    expect(screen.getByText("A")).toHaveAttribute("data-slot", "segmented-control-item");
  });
});
