import { config } from "@/config";

export function pathnameDirtyCheck(pathname: string) {
  return getDomainPathname(pathname).includes(`.${config.rootDomain}`);
}

export function getDomainPathname(pathname: string) {
  const base = pathname.split("/")[1];
  return base ? `/${base}` : "";
}

export const dirtySafePathname = (base: string) => {
  const possibleBase = getDomainPathname(base);
  const isDirty = possibleBase.includes(`.${config.rootDomain}`);
  return (pathname: string) => {
    return isDirty ? `${possibleBase}${pathname.startsWith("/") ? "" : "/"}${pathname}` : pathname;
  };
};
