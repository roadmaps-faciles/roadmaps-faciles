import { logger } from "@/lib/logger";

import { type IStorageProvider, type UploadResult } from "../IStorageProvider";

export class NoopStorageProvider implements IStorageProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async upload(key: string, _buffer: Buffer, _contentType: string): Promise<UploadResult> {
    logger.debug({ key }, "NoopStorageProvider upload");
    return { key, url: `https://noop.local/${key}` };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async delete(key: string): Promise<void> {
    logger.debug({ key }, "NoopStorageProvider delete");
  }

  public getPublicUrl(key: string): string {
    return `https://noop.local/${key}`;
  }
}
