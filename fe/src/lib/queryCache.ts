interface CacheEntry<T> {
  data: T;
  updatedAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T) {
    this.cache.set(key, { data, updatedAt: Date.now() });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key)?.data as T | undefined;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();
