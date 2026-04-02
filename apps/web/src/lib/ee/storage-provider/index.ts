import { config } from "@/config";

import { NoopStorageProvider } from "./impl/NoopStorageProvider";
import { S3StorageProvider } from "./impl/S3StorageProvider";
import { type IStorageProvider } from "./IStorageProvider";

let instance: IStorageProvider | null = null;

export const getStorageProvider = (): IStorageProvider => {
  if (instance) return instance;

  switch (config.storageProvider.type) {
    case "s3":
      instance = new S3StorageProvider();
      break;
    case "noop":
    default:
      instance = new NoopStorageProvider();
      break;
  }

  return instance;
};
