import { LRUCache } from "lru-cache";

import { logger } from "@/lib/logger";
import { ensure } from "@/utils/function";
import { type Any } from "@/utils/types";

import { type UseCase } from "./types";

export interface CachedUseCaseOptions {
  /**
   * In seconds.
   * @default 30
   */
  revalidate?: number;
}

const GLOBAL_CACHE = new Map<string, LRUCache<string, Any>>();
const DEFAULT_KEY = "__default_key___";

export namespace AbstractCachedUseCase {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface CacheToUseCase {}
}

/**
 * When extended, give cache capabilities with the stale-while-revalidate pattern.
 *
 * `cachedExecute()` method must be implemented instead of `execute()` which will be implicitly called.
 *
 * Default revalidate is 30 seconds.
 */
export abstract class AbstractCachedUseCase<TRequest, TResponse extends object> implements UseCase<
  TRequest,
  TResponse
> {
  protected debug = false;
  protected abstract cacheMasterKey: string;
  protected defaultOptions: CachedUseCaseOptions = {
    // TODO: make it globaly configurable?
    revalidate: 30,
  };

  protected abstract cachedExecute(request: TRequest): Promise<TResponse>;
  public async execute(request: TRequest, options = this.defaultOptions): Promise<TResponse> {
    const cache = this.getCache(options);
    const cacheKey = this.getCacheKey(request);
    const status: LRUCache.Status<TResponse> = {};
    const hasValue = cache.has(cacheKey, { status });

    if (!hasValue) {
      const pResult = this.cachedExecute(request);
      if (status.has === "stale") {
        if (this.debug) logger.info({ cacheKey: this.cacheMasterKey, request }, "Cache hit but stale");
        void pResult.then(result => cache.set(cacheKey, result));

        return cache.get(cacheKey, { allowStale: true })!;
      }

      if (this.debug) logger.info({ cacheKey: this.cacheMasterKey, request }, "Cache miss");
      return pResult.then(result => {
        cache.set(cacheKey, result);
        return result;
      });
    }

    const result = cache.get(cacheKey)!;
    if (this.debug) logger.info({ cacheKey: this.cacheMasterKey, request, result }, "Cache hit");
    return result;
  }

  private getCacheKey(param: TRequest) {
    return ensure(() => JSON.stringify(param), DEFAULT_KEY);
  }

  private getCache({ revalidate = 30 } = this.defaultOptions) {
    if (!GLOBAL_CACHE.has(this.cacheMasterKey)) {
      GLOBAL_CACHE.set(
        this.cacheMasterKey,
        new LRUCache<string, TResponse>({
          max: 250,
          updateAgeOnGet: false,
          updateAgeOnHas: false,
          allowStale: false,
          ttl: 1000 * revalidate,
        }),
      );
    }
    return GLOBAL_CACHE.get(this.cacheMasterKey) as LRUCache<string, TResponse>;
  }

  public static revalidate<K extends keyof AbstractCachedUseCase.CacheToUseCase>(key: K) {
    const cache = GLOBAL_CACHE.get(key);
    if (cache) {
      cache.clear();
    }
  }
}
