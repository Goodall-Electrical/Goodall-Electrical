import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter } from "../../src/lib/rate-limit";

describe("createRateLimiter", () => {
  let now = 0;
  const clock = () => now;

  beforeEach(() => {
    now = 1_700_000_000_000;
  });

  it("allows up to the limit per window", () => {
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
  });

  it("blocks once the limit is exceeded", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
  });

  it("counts separately per key", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("5.6.7.8")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
  });

  it("resets after the window passes", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
    now += 60_001;
    expect(rl.check("1.2.3.4")).toBe(true);
  });
});
