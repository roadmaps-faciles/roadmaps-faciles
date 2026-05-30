export interface UploadResult {
  key: string;
  url: string;
}

export interface ObjectStream {
  body: ReadableStream;
  contentLength: number;
  contentType: string;
}

export interface IStorageProvider {
  delete(key: string): Promise<void>;
  /**
   * Fetch un objet du storage et le retourne en stream. Utilisé par /api/uploads/[...key]
   * pour servir les assets sans exposer l'URL S3 publique (évite divulgation + CSP).
   * Retourne null si l'objet n'existe pas.
   */
  getObject(key: string): Promise<null | ObjectStream>;
  getPublicUrl(key: string): string;
  upload(key: string, buffer: Buffer, contentType: string): Promise<UploadResult>;
}
