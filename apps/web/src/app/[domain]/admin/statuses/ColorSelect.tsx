"use client";

import { cn } from "@roadmaps-faciles/ui";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { useState } from "react";

import { POST_STATUS_COLOR, type PostStatusColor } from "@/lib/model/PostStatus";

import { StatusBadge } from "./StatusBadge";

interface ColorSelectProps {
  disabled?: boolean;
  label: string;
  onChange: (value: PostStatusColor) => void;
  value: PostStatusColor;
}

const colors = Object.keys(POST_STATUS_COLOR) as Array<keyof typeof POST_STATUS_COLOR>;

export const ColorSelect = ({ label, value, onChange, disabled }: ColorSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleSelect = (color: PostStatusColor) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs text-left",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <StatusBadge color={value}>{value}</StatusBadge>
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full inset-x-0 mt-1 bg-popover border border-border rounded-md max-h-75 overflow-y-auto z-20 shadow-md">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelect(color)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    value === color ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <StatusBadge color={color}>{color}</StatusBadge>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
