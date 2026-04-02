import "server-only";

import { DIRTY_DOMAIN_HEADER } from "./config";

export async function getDirtyDomain() {
  const { headers } = await import("next/headers");
  const dirtyDomainHeader = (await headers()).get(DIRTY_DOMAIN_HEADER);
  return dirtyDomainHeader !== "false" ? dirtyDomainHeader : null;
}
