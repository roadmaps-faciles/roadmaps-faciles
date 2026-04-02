"use client";

import { Header, type HeaderProps } from "./Header";

type RootHeaderProps = {
  brandName: React.ReactNode;
} & Omit<HeaderProps, "serviceName" | "variant">;

export const RootHeader = (props: RootHeaderProps) => <Header {...props} variant="root" />;
export type { RootHeaderProps };
