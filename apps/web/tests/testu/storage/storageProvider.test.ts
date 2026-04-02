import { NoopStorageProvider } from "@/lib/ee/storage-provider/impl/NoopStorageProvider";

describe("NoopStorageProvider", () => {
  const provider = new NoopStorageProvider();

  describe("getPublicUrl", () => {
    it("returns noop.local URL with key", () => {
      expect(provider.getPublicUrl("tenants/1/images/abc.png")).toBe("https://noop.local/tenants/1/images/abc.png");
    });

    it("handles nested key paths", () => {
      expect(provider.getPublicUrl("some/deep/path/file.jpg")).toBe("https://noop.local/some/deep/path/file.jpg");
    });
  });

  describe("upload", () => {
    it("returns key and noop URL", async () => {
      const result = await provider.upload("tenants/1/images/abc.png", Buffer.from("test"), "image/png");

      expect(result.key).toBe("tenants/1/images/abc.png");
      expect(result.url).toBe("https://noop.local/tenants/1/images/abc.png");
    });
  });

  describe("delete", () => {
    it("resolves without error", async () => {
      await expect(provider.delete("tenants/1/images/abc.png")).resolves.toBeUndefined();
    });
  });
});

describe("S3StorageProvider.getPublicUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("builds URL from publicUrl config", async () => {
    vi.doMock("@/config", () => ({
      config: {
        storageProvider: {
          s3: {
            publicUrl: "https://cdn.example.com/bucket",
            endpoint: "",
            bucket: "bucket",
          },
        },
      },
    }));

    const { S3StorageProvider } = await import("@/lib/ee/storage-provider/impl/S3StorageProvider");
    const provider = new S3StorageProvider();

    expect(provider.getPublicUrl("tenants/1/images/abc.png")).toBe(
      "https://cdn.example.com/bucket/tenants/1/images/abc.png",
    );
  });

  it("strips trailing slash from publicUrl", async () => {
    vi.doMock("@/config", () => ({
      config: {
        storageProvider: {
          s3: {
            publicUrl: "https://cdn.example.com/bucket/",
            endpoint: "",
            bucket: "bucket",
          },
        },
      },
    }));

    const { S3StorageProvider } = await import("@/lib/ee/storage-provider/impl/S3StorageProvider");
    const provider = new S3StorageProvider();

    expect(provider.getPublicUrl("tenants/1/images/abc.png")).toBe(
      "https://cdn.example.com/bucket/tenants/1/images/abc.png",
    );
  });

  it("falls back to endpoint/bucket/key when publicUrl is empty", async () => {
    vi.doMock("@/config", () => ({
      config: {
        storageProvider: {
          s3: {
            publicUrl: "",
            endpoint: "http://localhost:9000",
            bucket: "my-bucket",
          },
        },
      },
    }));

    const { S3StorageProvider } = await import("@/lib/ee/storage-provider/impl/S3StorageProvider");
    const provider = new S3StorageProvider();

    expect(provider.getPublicUrl("tenants/1/images/abc.png")).toBe(
      "http://localhost:9000/my-bucket/tenants/1/images/abc.png",
    );
  });

  it("throws when neither publicUrl nor endpoint is configured", async () => {
    vi.doMock("@/config", () => ({
      config: {
        storageProvider: {
          s3: {
            publicUrl: "",
            endpoint: "",
            bucket: "bucket",
          },
        },
      },
    }));

    const { S3StorageProvider } = await import("@/lib/ee/storage-provider/impl/S3StorageProvider");
    const provider = new S3StorageProvider();

    expect(() => provider.getPublicUrl("tenants/1/images/abc.png")).toThrow(
      "S3StorageProvider: either STORAGE_S3_PUBLIC_URL or STORAGE_S3_ENDPOINT must be configured",
    );
  });
});
