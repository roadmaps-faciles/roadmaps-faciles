/**
 * Locale-agnostic navigation re-exports.
 *
 * Locale is managed by cookie only (no URL prefix), so these are
 * simple pass-throughs from next/link and next/navigation.
 */
export { default as Link } from "next/link";
export type { LinkProps } from "next/link";
export { redirect, usePathname, useRouter } from "next/navigation";
