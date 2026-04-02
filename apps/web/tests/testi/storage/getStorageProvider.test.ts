describe("getStorageProvider", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns NoopStorageProvider when type is 'noop'", async () => {
    vi.doMock("@/config", () => ({
      config: { storageProvider: { type: "noop" } },
    }));

    const { getStorageProvider } = await import("@/lib/ee/storage-provider");
    const { NoopStorageProvider } = await import("@/lib/ee/storage-provider/impl/NoopStorageProvider");
    const provider = getStorageProvider();

    expect(provider).toBeInstanceOf(NoopStorageProvider);
  });

  it("returns S3StorageProvider when type is 's3'", async () => {
    vi.doMock("@/config", () => ({
      config: {
        storageProvider: {
          type: "s3",
          s3: {
            endpoint: "http://localhost:9000",
            region: "us-east-1",
            bucket: "test",
            accessKeyId: "test",
            secretAccessKey: "test",
            publicUrl: "http://localhost:9000/test",
          },
        },
      },
    }));

    const { getStorageProvider } = await import("@/lib/ee/storage-provider");
    const { S3StorageProvider } = await import("@/lib/ee/storage-provider/impl/S3StorageProvider");
    const provider = getStorageProvider();

    expect(provider).toBeInstanceOf(S3StorageProvider);
  });

  it("defaults to NoopStorageProvider for unknown type", async () => {
    vi.doMock("@/config", () => ({
      config: { storageProvider: { type: "unknown" } },
    }));

    const { getStorageProvider } = await import("@/lib/ee/storage-provider");
    const { NoopStorageProvider } = await import("@/lib/ee/storage-provider/impl/NoopStorageProvider");
    const provider = getStorageProvider();

    expect(provider).toBeInstanceOf(NoopStorageProvider);
  });

  it("returns the same singleton instance on subsequent calls", async () => {
    vi.doMock("@/config", () => ({
      config: { storageProvider: { type: "noop" } },
    }));

    const { getStorageProvider } = await import("@/lib/ee/storage-provider");
    const first = getStorageProvider();
    const second = getStorageProvider();

    expect(first).toBe(second);
  });
});
