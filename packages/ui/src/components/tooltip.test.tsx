import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
  it("renders trigger with data-slot", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "tooltip-trigger");
  });

  it("renders content when controlled open", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent data-testid="content">Always visible</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    // Radix tooltip renders content in a portal with duplicate for accessibility
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "tooltip-content");
  });

  it("content has data-slot tooltip-content", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent data-testid="content" className="custom">
            Content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("content")).toHaveClass("custom");
  });

  it("does not render content when closed", () => {
    render(
      <TooltipProvider>
        <Tooltip open={false}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent data-testid="content">Hidden</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("renders inside TooltipProvider without errors", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("trigger has correct data-state when closed", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "closed");
  });

  it("trigger has data-state instant-open when controlled open", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger data-testid="trigger">Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "instant-open");
  });
});
