import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { getStorageProvider } from "@/lib/ee/storage-provider";
import { VALID_STORAGE_KEY_PATTERN } from "@/lib/ee/storage-provider/validation";

export async function GET(_request: Request, props: { params: Promise<{ key: string[] }> }) {
  const { key } = await props.params;
  const keyPath = key.join("/");

  if (!VALID_STORAGE_KEY_PATTERN.test(keyPath)) {
    return NextResponse.json({ error: "Invalid key" }, { status: StatusCodes.BAD_REQUEST });
  }

  const storage = getStorageProvider();
  const url = storage.getPublicUrl(keyPath);

  return NextResponse.redirect(url, 302);
}
