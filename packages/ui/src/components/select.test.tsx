import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
  it("renders trigger with data-slot", () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "select-trigger");
  });

  it("renders combobox role", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("trigger has aria-expanded attribute", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    // Radix Select trigger has aria-expanded for screen readers
    expect(trigger).toHaveAttribute("aria-expanded");
  });

  it("shows placeholder text", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });

  it("shows selected value", () => {
    render(
      <Select value="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });
});

describe("SelectTrigger", () => {
  it("forwards className", () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger" className="custom">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("trigger")).toHaveClass("custom");
  });

  it("supports size=sm", () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-size", "sm");
  });

  it("supports disabled state", () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});

describe("SelectGroup + SelectLabel", () => {
  // Radix Select content renders in a Portal which may not be fully
  // accessible in happy-dom. Test the composition works without errors.
  it("renders without errors", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
