import { AbstractCachedUseCase } from "@/useCases/AbstractCacheUseCase";

// Implémentation concrète pour tester la classe abstraite
class TestCacheUseCase extends AbstractCachedUseCase<string, { value: string }> {
  protected cacheMasterKey = "test-cache";
  public executeFn = vi.fn<(request: string) => Promise<{ value: string }>>();

  protected async cachedExecute(request: string): Promise<{ value: string }> {
    return this.executeFn(request);
  }
}

describe("AbstractCachedUseCase", () => {
  let useCase: TestCacheUseCase;

  beforeEach(() => {
    useCase = new TestCacheUseCase();
    // Vide le cache global entre chaque test
    AbstractCachedUseCase.revalidate("test-cache" as never);
  });

  it("executes and caches on first call (cache miss)", async () => {
    useCase.executeFn.mockResolvedValue({ value: "result" });

    const result = await useCase.execute("input");

    expect(result).toEqual({ value: "result" });
    expect(useCase.executeFn).toHaveBeenCalledTimes(1);
  });

  it("returns cached value on second call (cache hit)", async () => {
    useCase.executeFn.mockResolvedValue({ value: "result" });

    await useCase.execute("input");
    const result = await useCase.execute("input");

    expect(result).toEqual({ value: "result" });
    expect(useCase.executeFn).toHaveBeenCalledTimes(1);
  });

  it("caches separately for different inputs", async () => {
    useCase.executeFn.mockImplementation(async input => ({ value: `result-${input}` }));

    const result1 = await useCase.execute("a");
    const result2 = await useCase.execute("b");

    expect(result1).toEqual({ value: "result-a" });
    expect(result2).toEqual({ value: "result-b" });
    expect(useCase.executeFn).toHaveBeenCalledTimes(2);
  });

  it("revalidate() clears the cache", async () => {
    useCase.executeFn.mockResolvedValue({ value: "v1" });

    await useCase.execute("input");
    expect(useCase.executeFn).toHaveBeenCalledTimes(1);

    AbstractCachedUseCase.revalidate("test-cache" as never);

    useCase.executeFn.mockResolvedValue({ value: "v2" });
    const result = await useCase.execute("input");

    expect(useCase.executeFn).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ value: "v2" });
  });

  it("re-executes after revalidation (simulates TTL expiration)", async () => {
    useCase.executeFn.mockResolvedValue({ value: "v1" });

    const result1 = await useCase.execute("input");
    expect(result1).toEqual({ value: "v1" });
    expect(useCase.executeFn).toHaveBeenCalledTimes(1);

    // Simule l'expiration en vidant le cache manuellement (équivalent TTL expiré)
    AbstractCachedUseCase.revalidate("test-cache" as never);

    useCase.executeFn.mockResolvedValue({ value: "v2" });
    const result2 = await useCase.execute("input");

    expect(useCase.executeFn).toHaveBeenCalledTimes(2);
    expect(result2).toEqual({ value: "v2" });
  });
});
