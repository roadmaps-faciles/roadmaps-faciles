import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

describe("Accordion", () => {
  it("renders with data-slot", () => {
    render(
      <Accordion type="single" collapsible data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId("accordion")).toHaveAttribute("data-slot", "accordion");
  });

  it("expands on click", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByText("Trigger");
    await user.click(trigger);
    expect(screen.getByText("Content")).toBeVisible();
  });

  it("collapses on second click when collapsible", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByText("Trigger");
    await user.click(trigger);
    expect(screen.getByText("Content")).toBeVisible();
    await user.click(trigger);
    // When collapsed, Radix may hide content or mark it as hidden
    const content = screen.queryByText("Content");
    expect(content === null || content.closest('[data-state="closed"]')).toBeTruthy();
  });

  it("supports multiple items", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByText("First"));
    await user.click(screen.getByText("Second"));
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.getByText("Content 2")).toBeVisible();
  });
});

describe("AccordionItem", () => {
  it("renders with data-slot", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "accordion-item");
  });

  it("forwards className", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="item" className="custom">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId("item")).toHaveClass("custom");
  });
});

describe("AccordionTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "accordion-trigger");
  });

  it("forwards className", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="custom" data-testid="trigger">
            Trigger
          </AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId("trigger")).toHaveClass("custom");
  });
});

describe("AccordionContent", () => {
  it("renders with data-slot", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent data-testid="content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByText("Trigger"));
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "accordion-content");
  });
});
