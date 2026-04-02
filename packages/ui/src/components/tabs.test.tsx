import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "./tabs";

describe("Tabs", () => {
  it("renders with data-slot", () => {
    render(
      <Tabs defaultValue="tab1" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("tabs")).toHaveAttribute("data-slot", "tabs");
  });

  it("forwards className", () => {
    render(
      <Tabs defaultValue="tab1" data-testid="tabs" className="custom">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("tabs")).toHaveClass("custom");
  });

  it("switches tab content on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();

    await user.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeInTheDocument();
    // Tab 1 trigger should no longer be active
    expect(screen.getByText("Tab 1").closest("[data-state]")).toHaveAttribute("data-state", "inactive");
    expect(screen.getByText("Tab 2").closest("[data-state]")).toHaveAttribute("data-state", "active");
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    screen.getByText("Tab 1").focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Tab 2")).toHaveFocus();
  });
});

describe("TabsList", () => {
  it("renders with data-slot", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("list")).toHaveAttribute("data-slot", "tabs-list");
  });

  it("applies default variant", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("list")).toHaveAttribute("data-variant", "default");
  });

  it("applies line variant", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="list" variant="line">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("list")).toHaveAttribute("data-variant", "line");
  });
});

describe("TabsTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "tabs-trigger");
  });

  it("has active state", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "active");
  });
});

describe("TabsContent", () => {
  it("renders with data-slot", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">
          Content
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "tabs-content");
  });

  it("forwards className", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content" className="custom">
          Content
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("content")).toHaveClass("custom");
  });
});

describe("tabsListVariants", () => {
  it("exports tabsListVariants function", () => {
    const classes = tabsListVariants({ variant: "default" });
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("border");
  });

  it("generates line variant classes", () => {
    const classes = tabsListVariants({ variant: "line" });
    expect(classes).toContain("bg-transparent");
  });
});
