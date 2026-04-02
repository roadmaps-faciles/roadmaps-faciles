import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("renders with data-slot", () => {
    render(
      <RadioGroup data-testid="radio-group">
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    expect(screen.getByTestId("radio-group")).toHaveAttribute("data-slot", "radio-group");
  });

  it("forwards className", () => {
    render(
      <RadioGroup data-testid="radio-group" className="custom">
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    expect(screen.getByTestId("radio-group")).toHaveClass("custom");
  });

  it("renders radio role", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("selects an option on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    await user.click(radios[1]);
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("supports controlled value", () => {
    render(
      <RadioGroup value="b">
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toHaveAttribute("data-state", "checked");
  });
});

describe("RadioGroupItem", () => {
  it("renders with data-slot", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" data-testid="item" />
      </RadioGroup>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "radio-group-item");
  });

  it("forwards className", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" data-testid="item" className="custom" />
      </RadioGroup>,
    );
    expect(screen.getByTestId("item")).toHaveClass("custom");
  });

  it("supports disabled state", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toBeDisabled();
  });
});
