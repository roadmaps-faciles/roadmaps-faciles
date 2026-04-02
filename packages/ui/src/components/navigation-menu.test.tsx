import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

describe("NavigationMenu", () => {
  it("renders with data-slot", () => {
    render(
      <NavigationMenu data-testid="nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("nav")).toHaveAttribute("data-slot", "navigation-menu");
  });

  it("forwards className", () => {
    render(
      <NavigationMenu data-testid="nav" className="custom">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("nav")).toHaveClass("custom");
  });

  it("renders with viewport by default", () => {
    render(
      <NavigationMenu data-testid="nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("nav")).toHaveAttribute("data-viewport", "true");
  });

  it("supports viewport=false", () => {
    render(
      <NavigationMenu data-testid="nav" viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("nav")).toHaveAttribute("data-viewport", "false");
  });
});

describe("NavigationMenuList", () => {
  it("renders with data-slot", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList data-testid="list">
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("list")).toHaveAttribute("data-slot", "navigation-menu-list");
  });
});

describe("NavigationMenuItem", () => {
  it("renders with data-slot", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem data-testid="item">
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "navigation-menu-item");
  });
});

describe("NavigationMenuLink", () => {
  it("renders with data-slot", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink data-testid="link" href="#">
              Link
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("link")).toHaveAttribute("data-slot", "navigation-menu-link");
  });

  it("forwards className", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink data-testid="link" className="custom" href="#">
              Link
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("link")).toHaveClass("custom");
  });
});

describe("NavigationMenuTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid="trigger">Menu</NavigationMenuTrigger>
            <NavigationMenuContent>Content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "navigation-menu-trigger");
  });
});

describe("NavigationMenuIndicator", () => {
  // NavigationMenuIndicator only renders when a menu item is active/hovered.
  // In happy-dom without user interaction, it may not appear in the DOM.
  it("is exported and can be used in composition", () => {
    // Verify NavigationMenuIndicator is a valid component
    expect(NavigationMenuIndicator).toBeDefined();
    expect(typeof NavigationMenuIndicator).toBe("function");
  });
});

describe("navigationMenuTriggerStyle", () => {
  it("returns class string", () => {
    const classes = navigationMenuTriggerStyle();
    expect(classes).toContain("inline-flex");
  });
});
