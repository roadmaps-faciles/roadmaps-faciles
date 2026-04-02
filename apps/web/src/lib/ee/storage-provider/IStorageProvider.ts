export interface UploadResult {
  key: string;
  url: string;
}

export interface IStorageProvider {
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  upload(key: string, buffer: Buffer, contentType: string): Promise<UploadResult>;
}
