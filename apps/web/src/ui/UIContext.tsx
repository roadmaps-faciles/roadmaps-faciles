"use client";

import { createContext, use } from "react";

import { type UiTheme } from "./types";

const UIContext = createContext<UiTheme>("Default");

export const UIProvider = ({ children, value }: { children: React.ReactNode; value: UiTheme }) => (
  <UIContext value={value}>{children}</UIContext>
);

export const useUI = (): UiTheme => use(UIContext);
