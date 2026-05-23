interface Options {
  limit: number;
  windowMs: number;
  now?: () => number;
}

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): boolean;
}

export function createRateLimiter(opts: Options): RateLimiter {
  const now = opts.now ?? (() => Date.now());
  const store = new Map<string, Entry>();

  return {
    check(key: string): boolean {
      const t = now();
      const entry = store.get(key);
      if (!entry || entry.resetAt <= t) {
        store.set(key, { count: 1, resetAt: t + opts.windowMs });
        return true;
      }
      if (entry.count >= opts.limit) return false;
      entry.count++;
      return true;
    },
  };
}
