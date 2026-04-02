import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { config } from "@/config";
import { logger } from "@/lib/logger";

import { type IStorageProvider, type UploadResult } from "../IStorageProvider";

export class S3StorageProvider implements IStorageProvider {
  private client: null | S3Client = null;

  private get s3Config() {
    return config.storageProvider.s3;
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        endpoint: this.s3Config.endpoint || undefined,
        region: this.s3Config.region,
        credentials: {
          accessKeyId: this.s3Config.accessKeyId,
          secretAccessKey: this.s3Config.secretAccessKey,
        },
        forcePathStyle: true,
      });
    }
    return this.client;
  }

  public async upload(key: string, buffer: Buffer, contentType: string): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    await this.getClient().send(command);
    const url = this.getPublicUrl(key);
    logger.debug({ key, url }, "S3StorageProvider uploaded");

    return { key, url };
  }

  public async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
    });

    await this.getClient().send(command);
    logger.debug({ key }, "S3StorageProvider deleted");
  }

  public getPublicUrl(key: string): string {
    if (this.s3Config.publicUrl) {
      return `${this.s3Config.publicUrl.replace(/\/$/, "")}/${key}`;
    }
    if (!this.s3Config.endpoint) {
      throw new Error("S3StorageProvider: either STORAGE_S3_PUBLIC_URL or STORAGE_S3_ENDPOINT must be configured");
    }
    return `${this.s3Config.endpoint}/${this.s3Config.bucket}/${key}`;
  }
}
