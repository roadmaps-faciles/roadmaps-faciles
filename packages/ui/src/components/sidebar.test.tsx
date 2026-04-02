import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

// Helper wrapper to provide SidebarProvider context
function SidebarWrapper({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe("SidebarProvider", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarProvider data-testid="provider">
        <div>Content</div>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("provider")).toHaveAttribute("data-slot", "sidebar-wrapper");
  });

  it("forwards className", () => {
    render(
      <SidebarProvider data-testid="provider" className="custom">
        <div>Content</div>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("provider")).toHaveClass("custom");
  });

  it("sets CSS variables for sidebar width", () => {
    render(
      <SidebarProvider data-testid="provider">
        <div>Content</div>
      </SidebarProvider>,
    );
    const provider = screen.getByTestId("provider");
    expect(provider.style.getPropertyValue("--sidebar-width")).toBe("16rem");
    expect(provider.style.getPropertyValue("--sidebar-width-icon")).toBe("3rem");
  });
});

describe("useSidebar", () => {
  it("throws when used outside SidebarProvider", () => {
    const TestComponent = () => {
      useSidebar();
      return null;
    };

    // Suppress console.error for expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow("useSidebar must be used within a SidebarProvider.");
    spy.mockRestore();
  });

  it("provides context values", () => {
    let contextValue: ReturnType<typeof useSidebar> | undefined;
    const TestComponent = () => {
      contextValue = useSidebar();
      return null;
    };

    render(
      <SidebarWrapper>
        <TestComponent />
      </SidebarWrapper>,
    );

    expect(contextValue).toBeDefined();
    expect(contextValue!.state).toBe("expanded");
    expect(contextValue!.open).toBe(true);
    expect(contextValue!.isMobile).toBe(false);
  });
});

describe("Sidebar", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <Sidebar data-testid="sidebar">
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarWrapper>,
    );
    // The sidebar renders a wrapper div with data-slot="sidebar"
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders non-collapsible variant", () => {
    render(
      <SidebarWrapper>
        <Sidebar collapsible="none" data-testid="sidebar">
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-slot", "sidebar");
  });
});

describe("SidebarTrigger", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarTrigger data-testid="trigger" />
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-slot", "sidebar-trigger");
  });

  it("toggles sidebar on click", async () => {
    const user = userEvent.setup();
    let contextValue: ReturnType<typeof useSidebar> | undefined;
    const ContextReader = () => {
      contextValue = useSidebar();
      return null;
    };

    render(
      <SidebarProvider>
        <SidebarTrigger data-testid="trigger" />
        <ContextReader />
      </SidebarProvider>,
    );

    expect(contextValue!.state).toBe("expanded");
    await user.click(screen.getByTestId("trigger"));
    expect(contextValue!.state).toBe("collapsed");
  });

  it("has sr-only toggle text", () => {
    render(
      <SidebarWrapper>
        <SidebarTrigger />
      </SidebarWrapper>,
    );
    expect(screen.getByText("Toggle Sidebar")).toBeInTheDocument();
  });
});

describe("SidebarHeader", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarHeader data-testid="header">Header</SidebarHeader>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "sidebar-header");
  });

  it("forwards className", () => {
    render(
      <SidebarWrapper>
        <SidebarHeader data-testid="header" className="custom">
          Header
        </SidebarHeader>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("header")).toHaveClass("custom");
  });
});

describe("SidebarFooter", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarFooter data-testid="footer">Footer</SidebarFooter>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "sidebar-footer");
  });
});

describe("SidebarContent", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarContent data-testid="content">Content</SidebarContent>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "sidebar-content");
  });
});

describe("SidebarSeparator", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarSeparator data-testid="separator" />
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("separator")).toHaveAttribute("data-slot", "sidebar-separator");
  });
});

describe("SidebarInput", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarInput data-testid="input" />
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("input")).toHaveAttribute("data-slot", "sidebar-input");
  });
});

describe("SidebarInset", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarInset data-testid="inset">Main content</SidebarInset>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("inset")).toHaveAttribute("data-slot", "sidebar-inset");
  });

  it("renders as main element", () => {
    render(
      <SidebarWrapper>
        <SidebarInset data-testid="inset">Main content</SidebarInset>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("inset").tagName).toBe("MAIN");
  });
});

describe("SidebarGroup", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarGroup data-testid="group">Group</SidebarGroup>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("group")).toHaveAttribute("data-slot", "sidebar-group");
  });
});

describe("SidebarGroupLabel", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarGroupLabel data-testid="label">Label</SidebarGroupLabel>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("label")).toHaveAttribute("data-slot", "sidebar-group-label");
  });

  it("supports asChild", () => {
    render(
      <SidebarWrapper>
        <SidebarGroupLabel asChild>
          <span data-testid="label">Custom Label</span>
        </SidebarGroupLabel>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("label")).toHaveAttribute("data-slot", "sidebar-group-label");
  });
});

describe("SidebarGroupAction", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarGroupAction data-testid="action">Action</SidebarGroupAction>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("action")).toHaveAttribute("data-slot", "sidebar-group-action");
  });
});

describe("SidebarGroupContent", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarGroupContent data-testid="content">Content</SidebarGroupContent>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "sidebar-group-content");
  });
});

describe("SidebarMenu", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenu data-testid="menu">
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("menu")).toHaveAttribute("data-slot", "sidebar-menu");
  });
});

describe("SidebarMenuItem", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenu>
          <SidebarMenuItem data-testid="item">
            <SidebarMenuButton>Item</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "sidebar-menu-item");
  });
});

describe("SidebarMenuButton", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="button">Click</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("button")).toHaveAttribute("data-slot", "sidebar-menu-button");
  });

  it("supports isActive", () => {
    render(
      <SidebarWrapper>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="button" isActive>
              Active
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("button")).toHaveAttribute("data-active", "true");
  });

  it("supports size variants", () => {
    render(
      <SidebarWrapper>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="button" size="sm">
              Small
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("button")).toHaveAttribute("data-size", "sm");
  });
});

describe("SidebarMenuAction", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuAction data-testid="action">Action</SidebarMenuAction>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("action")).toHaveAttribute("data-slot", "sidebar-menu-action");
  });
});

describe("SidebarMenuBadge", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuBadge data-testid="badge">5</SidebarMenuBadge>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("badge")).toHaveAttribute("data-slot", "sidebar-menu-badge");
  });
});

describe("SidebarMenuSkeleton", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuSkeleton data-testid="skeleton" />
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("skeleton")).toHaveAttribute("data-slot", "sidebar-menu-skeleton");
  });

  it("shows icon skeleton when showIcon=true", () => {
    const { container } = render(
      <SidebarWrapper>
        <SidebarMenuSkeleton showIcon />
      </SidebarWrapper>,
    );
    const iconSkeleton = container.querySelector('[data-sidebar="menu-skeleton-icon"]');
    expect(iconSkeleton).toBeInTheDocument();
  });

  it("hides icon skeleton by default", () => {
    const { container } = render(
      <SidebarWrapper>
        <SidebarMenuSkeleton />
      </SidebarWrapper>,
    );
    const iconSkeleton = container.querySelector('[data-sidebar="menu-skeleton-icon"]');
    expect(iconSkeleton).not.toBeInTheDocument();
  });
});

describe("SidebarMenuSub", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuSub data-testid="sub">
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>Sub item</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("sub")).toHaveAttribute("data-slot", "sidebar-menu-sub");
  });
});

describe("SidebarMenuSubItem", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuSub>
          <SidebarMenuSubItem data-testid="sub-item">
            <SidebarMenuSubButton>Item</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("sub-item")).toHaveAttribute("data-slot", "sidebar-menu-sub-item");
  });
});

describe("SidebarMenuSubButton", () => {
  it("renders with data-slot", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton data-testid="sub-button">Button</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("sub-button")).toHaveAttribute("data-slot", "sidebar-menu-sub-button");
  });

  it("supports isActive", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton data-testid="sub-button" isActive>
              Active
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("sub-button")).toHaveAttribute("data-active", "true");
  });

  it("supports size=sm", () => {
    render(
      <SidebarWrapper>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton data-testid="sub-button" size="sm">
              Small
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarWrapper>,
    );
    expect(screen.getByTestId("sub-button")).toHaveAttribute("data-size", "sm");
  });
});

describe("Sidebar keyboard shortcut", () => {
  it("toggles on Ctrl+B", async () => {
    const user = userEvent.setup();
    let contextValue: ReturnType<typeof useSidebar> | undefined;
    const ContextReader = () => {
      contextValue = useSidebar();
      return null;
    };

    render(
      <SidebarProvider>
        <ContextReader />
      </SidebarProvider>,
    );

    expect(contextValue!.state).toBe("expanded");
    await user.keyboard("{Control>}b{/Control}");
    expect(contextValue!.state).toBe("collapsed");
    await user.keyboard("{Control>}b{/Control}");
    expect(contextValue!.state).toBe("expanded");
  });
});
