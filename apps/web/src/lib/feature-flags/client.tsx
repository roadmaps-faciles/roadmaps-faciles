"use client";

import { type ReactNode, createContext, useContext } from "react";

import { type FeatureFlagKey, type FeatureFlagsMap } from "./flags";

const FeatureFlagContext = createContext<FeatureFlagsMap | null>(null);

export const FeatureFlagProvider = ({ children, value }: { children: ReactNode; value: FeatureFlagsMap }) => {
  return <FeatureFlagContext value={value}>{children}</FeatureFlagContext>;
};

export const useFeatureFlag = (key: FeatureFlagKey): boolean => {
  const flags = useContext(FeatureFlagContext);
  if (!flags) {
    throw new Error("useFeatureFlag must be used within a FeatureFlagProvider");
  }
  return flags[key];
};
