import { type NextRequest, type NextResponse } from "next/server";

import { ANONYMOUS_ID_KEY, ANONYMOUS_ID_MAX_AGE } from "./config";

export function responseWithAnonymousId(request: NextRequest, response: NextResponse) {
  const existing = request.cookies.get(ANONYMOUS_ID_KEY)?.value;

  if (existing) return response;

  const id = crypto.randomUUID();
  response.cookies.set(ANONYMOUS_ID_KEY, id, {
    path: "/",
    maxAge: ANONYMOUS_ID_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
