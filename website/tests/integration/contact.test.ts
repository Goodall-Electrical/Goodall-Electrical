import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../../src/pages/api/contact";
import { setServicesForTest, resetServicesForTest, type AppServices } from "../../src/lib/runtime";
import { createRateLimiter } from "../../src/lib/rate-limit";

function buildServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    log: { append: vi.fn().mockResolvedValue(undefined) },
    email: vi.fn().mockResolvedValue(undefined) as unknown as AppServices["email"],
    fergus: { createLead: vi.fn().mockResolvedValue({ id: "L-1" }) },
    rateLimiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    logger: { warn: vi.fn(), error: vi.fn() },
    ...overrides,
  };
}

function makeRequest(body: Record<string, unknown>, ip = "1.2.3.4") {
  return new Request("http://test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
    body: JSON.stringify(body),
  });
}

type Ctx = Parameters<typeof POST>[0];

describe("POST /api/contact", () => {
  beforeEach(() => resetServicesForTest());

  it("returns 303 redirect to /contact?status=ok on a valid submission", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeRequest({
      name: "Jane", email: "jane@x.com", phone: "0400123456", message: "Hi", _hp: "",
    }), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toContain("/contact?status=ok");
    expect(services.email).toHaveBeenCalledTimes(1);
  });

  it("returns 400 on a malformed submission", async () => {
    setServicesForTest(buildServices());
    const res = await POST({ request: makeRequest({
      name: "", email: "bad", phone: "", message: "", _hp: "",
    }), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(400);
  });

  it("silently succeeds when honeypot is filled (returns ok but does nothing)", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeRequest({
      name: "Bot", email: "bot@x.com", phone: "0400123456", message: "spam", _hp: "filled",
    }), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(303);
    expect(services.email).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limit is hit", async () => {
    const services = buildServices({ rateLimiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    setServicesForTest(services);
    const body = { name: "Jane", email: "jane@x.com", phone: "0400123456", message: "Hi", _hp: "" };
    await POST({ request: makeRequest(body), clientAddress: "1.2.3.4" } as Ctx);
    const res = await POST({ request: makeRequest(body), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(429);
  });
});
