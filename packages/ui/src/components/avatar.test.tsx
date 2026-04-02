import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("renders with data-slot", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-slot", "avatar");
  });

  it("forwards className", () => {
    render(
      <Avatar data-testid="avatar" className="custom">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar")).toHaveClass("custom");
  });

  it("defaults to size=default", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "default");
  });

  it("supports size=lg", () => {
    render(
      <Avatar data-testid="avatar" size="lg">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "lg");
  });

  it("supports size=sm", () => {
    render(
      <Avatar data-testid="avatar" size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "sm");
  });
});

describe("AvatarFallback", () => {
  it("renders with data-slot", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-slot", "avatar-fallback");
  });

  it("renders fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

describe("AvatarImage", () => {
  // Radix AvatarImage only renders after the image successfully loads.
  // In happy-dom there's no real image loading, so the fallback always shows.
  it("renders fallback when image has not loaded", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    // Fallback is shown because image can't load in test env
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});

describe("AvatarBadge", () => {
  it("renders with data-slot", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
        <AvatarBadge data-testid="badge" />
      </Avatar>,
    );
    expect(screen.getByTestId("badge")).toHaveAttribute("data-slot", "avatar-badge");
  });
});

describe("AvatarGroup", () => {
  it("renders with data-slot", () => {
    render(<AvatarGroup data-testid="group" />);
    expect(screen.getByTestId("group")).toHaveAttribute("data-slot", "avatar-group");
  });

  it("forwards className", () => {
    render(<AvatarGroup data-testid="group" className="custom" />);
    expect(screen.getByTestId("group")).toHaveClass("custom");
  });
});

describe("AvatarGroupCount", () => {
  it("renders with data-slot", () => {
    render(<AvatarGroupCount data-testid="count">+3</AvatarGroupCount>);
    expect(screen.getByTestId("count")).toHaveAttribute("data-slot", "avatar-group-count");
  });
});
