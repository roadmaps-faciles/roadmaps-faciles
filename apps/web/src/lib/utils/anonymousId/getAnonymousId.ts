import { cookies } from "next/headers";

import { ANONYMOUS_ID_KEY } from "./config";

export async function getAnonymousId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANONYMOUS_ID_KEY)?.value;

  if (existing) return existing;

  throw new Error("Anonymous ID not found");
}
