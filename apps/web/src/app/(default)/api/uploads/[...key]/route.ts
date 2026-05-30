import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { getStorageProvider } from "@/lib/ee/storage-provider";
import { isValidStorageKey } from "@/lib/ee/storage-provider/validation";

// Sert les uploads depuis le storage en stream (au lieu de redirect vers l'URL S3).
// Évite :
// 1. La divulgation de l'URL S3/Garage publique au client.
// 2. Le CSP fail : avec un redirect, le browser tape sur prod.f.rmf.fr qui n'est pas
//    dans img-src 'self'. En streamant depuis 'self', le CSP standard suffit.
//
// Note perf : on perd le bénéfice du CDN direct (chaque request retourne via Next).
// Pour de gros volumes, mettre un cache reverse proxy devant (CDN, Caddy, Varnish).
export async function GET(_request: Request, props: { params: Promise<{ key: string[] }> }) {
  const { key } = await props.params;
  const keyPath = key.join("/");

  if (!isValidStorageKey(keyPath)) {
    return NextResponse.json({ error: "Invalid key" }, { status: StatusCodes.BAD_REQUEST });
  }

  const storage = getStorageProvider();
  const obj = await storage.getObject(keyPath);

  if (!obj) {
    return NextResponse.json({ error: "Not found" }, { status: StatusCodes.NOT_FOUND });
  }

  return new NextResponse(obj.body, {
    status: StatusCodes.OK,
    headers: {
      "Content-Type": obj.contentType,
      ...(obj.contentLength > 0 ? { "Content-Length": String(obj.contentLength) } : {}),
      // Les uploads ont des UUID uniques côté key, donc immutable.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
