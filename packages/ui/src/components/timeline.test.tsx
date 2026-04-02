import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  timelineDotVariants,
  TimelineItem,
  TimelineSeparator,
  TimelineSubConnector,
  TimelineSubItem,
} from "./timeline";

describe("Timeline", () => {
  it("renders with data-slot", () => {
    render(<Timeline data-testid="timeline">content</Timeline>);
    expect(screen.getByTestId("timeline")).toHaveAttribute("data-slot", "timeline");
  });

  it("renders children", () => {
    render(<Timeline>Timeline content</Timeline>);
    expect(screen.getByText("Timeline content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Timeline data-testid="timeline" className="custom-class">
        content
      </Timeline>,
    );
    expect(screen.getByTestId("timeline")).toHaveClass("custom-class");
  });
});

describe("TimelineItem", () => {
  it("renders with data-slot", () => {
    render(<TimelineItem data-testid="item">content</TimelineItem>);
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "timeline-item");
  });

  it("renders children", () => {
    render(<TimelineItem>Item content</TimelineItem>);
    expect(screen.getByText("Item content")).toBeInTheDocument();
  });
});

describe("TimelineSeparator", () => {
  it("renders with data-slot", () => {
    render(<TimelineSeparator data-testid="separator">content</TimelineSeparator>);
    expect(screen.getByTestId("separator")).toHaveAttribute("data-slot", "timeline-separator");
  });
});

describe("TimelineDot", () => {
  it("renders with data-slot", () => {
    render(<TimelineDot data-testid="dot" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-slot", "timeline-dot");
  });

  it("applies default variant", () => {
    render(<TimelineDot data-testid="dot" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-variant", "default");
  });

  it("applies outline variant", () => {
    render(<TimelineDot data-testid="dot" variant="outline" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-variant", "outline");
  });

  it("applies success variant", () => {
    render(<TimelineDot data-testid="dot" variant="success" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-variant", "success");
  });

  it("applies warning variant", () => {
    render(<TimelineDot data-testid="dot" variant="warning" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-variant", "warning");
  });

  it("applies destructive variant", () => {
    render(<TimelineDot data-testid="dot" variant="destructive" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-variant", "destructive");
  });

  it("applies muted variant", () => {
    render(<TimelineDot data-testid="dot" variant="muted" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-variant", "muted");
  });

  it("applies default size", () => {
    render(<TimelineDot data-testid="dot" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-size", "default");
  });

  it("applies sm size", () => {
    render(<TimelineDot data-testid="dot" size="sm" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-size", "sm");
  });

  it("applies lg size", () => {
    render(<TimelineDot data-testid="dot" size="lg" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-size", "lg");
  });

  it("applies icon size", () => {
    render(<TimelineDot data-testid="dot" size="icon" />);
    expect(screen.getByTestId("dot")).toHaveAttribute("data-size", "icon");
  });

  it("renders children (for icon content)", () => {
    render(<TimelineDot size="icon">★</TimelineDot>);
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("exports timelineDotVariants function", () => {
    const classes = timelineDotVariants({ variant: "default" });
    expect(classes).toContain("rounded-full");
  });
});

describe("TimelineConnector", () => {
  it("renders with data-slot", () => {
    render(<TimelineConnector data-testid="connector" />);
    expect(screen.getByTestId("connector")).toHaveAttribute("data-slot", "timeline-connector");
  });

  it("defaults to spaced variant", () => {
    render(<TimelineConnector data-testid="connector" />);
    expect(screen.getByTestId("connector").className).toContain("mt-2");
    expect(screen.getByTestId("connector").className).toContain("-mb-6");
  });

  it("supports connected variant", () => {
    render(<TimelineConnector data-testid="connector" variant="connected" />);
    expect(screen.getByTestId("connector").className).toContain("-mb-8");
    expect(screen.getByTestId("connector").className).not.toContain("-mb-6");
  });
});

describe("TimelineContent", () => {
  it("renders with data-slot", () => {
    render(<TimelineContent data-testid="content">text</TimelineContent>);
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "timeline-content");
  });

  it("renders children", () => {
    render(<TimelineContent>Content text</TimelineContent>);
    expect(screen.getByText("Content text")).toBeInTheDocument();
  });
});

describe("TimelineSubConnector", () => {
  it("renders with data-slot", () => {
    render(<TimelineSubConnector data-testid="sub-connector">child</TimelineSubConnector>);
    expect(screen.getByTestId("sub-connector")).toHaveAttribute("data-slot", "timeline-sub-connector");
  });

  it("renders children", () => {
    render(<TimelineSubConnector>Reply content</TimelineSubConnector>);
    expect(screen.getByText("Reply content")).toBeInTheDocument();
  });
});

describe("TimelineSubItem", () => {
  it("renders with data-slot", () => {
    render(<TimelineSubItem data-testid="sub-item">content</TimelineSubItem>);
    expect(screen.getByTestId("sub-item")).toHaveAttribute("data-slot", "timeline-sub-item");
  });

  it("renders children", () => {
    render(<TimelineSubItem>Reply card</TimelineSubItem>);
    expect(screen.getByText("Reply card")).toBeInTheDocument();
  });

  it("renders sub-hook element", () => {
    render(<TimelineSubItem data-testid="sub-item">content</TimelineSubItem>);
    const hook = screen.getByTestId("sub-item").querySelector("[data-slot='sub-hook']");
    expect(hook).toBeInTheDocument();
  });

  it("works inside TimelineSubConnector", () => {
    render(
      <TimelineSubConnector data-testid="wrapper">
        <TimelineSubItem>First reply</TimelineSubItem>
        <TimelineSubItem>Second reply</TimelineSubItem>
      </TimelineSubConnector>,
    );
    expect(screen.getByText("First reply")).toBeInTheDocument();
    expect(screen.getByText("Second reply")).toBeInTheDocument();
  });
});

describe("Timeline compound", () => {
  it("renders a complete timeline structure", () => {
    render(
      <Timeline data-testid="timeline">
        <TimelineItem data-testid="item-1">
          <TimelineSeparator>
            <TimelineDot variant="success" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>First event</TimelineContent>
        </TimelineItem>
        <TimelineItem data-testid="item-2">
          <TimelineSeparator>
            <TimelineDot variant="outline" />
          </TimelineSeparator>
          <TimelineContent>Second event</TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("timeline")).toBeInTheDocument();
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-2")).toBeInTheDocument();
    expect(screen.getByText("First event")).toBeInTheDocument();
    expect(screen.getByText("Second event")).toBeInTheDocument();
  });
});
