import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../../src/pages/api/quote";
import { setServicesForTest, resetServicesForTest, type AppServices } from "../../src/lib/runtime";
import { createRateLimiter } from "../../src/lib/rate-limit";

function buildServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    log: { append: vi.fn().mockResolvedValue(undefined) },
    email: vi.fn().mockResolvedValue(undefined) as unknown as AppServices["email"],
    fergus: { createLead: vi.fn().mockResolvedValue({ id: "L-99" }) },
    rateLimiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    logger: { warn: vi.fn(), error: vi.fn() },
    ...overrides,
  };
}

function makeForm(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request("http://test/api/quote", { method: "POST", body: fd });
}

type Ctx = Parameters<typeof POST>[0];

const validFields = {
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "0400 123 456",
  jobType: "electrical",
  siteType: "hospitality",
  urgency: "within-a-week",
  siteAddress: "1 Main St, Sale VIC",
  description: "Need 3-phase install for new gaming room.",
  _hp: "",
};

describe("POST /api/quote", () => {
  beforeEach(() => resetServicesForTest());

  it("accepts a valid multipart submission and triggers log + email + fergus", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeForm(validFields), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toContain("/quote?status=ok");
    expect(services.log.append).toHaveBeenCalledTimes(1);
    expect(services.email).toHaveBeenCalledTimes(1);
    expect(services.fergus.createLead).toHaveBeenCalledTimes(1);
  });

  it("returns 400 on missing fields", async () => {
    setServicesForTest(buildServices());
    const res = await POST({ request: makeForm({ name: "x" }), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(400);
  });

  it("silently accepts honeypot-filled submissions", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeForm({ ...validFields, _hp: "spam" }), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(303);
    expect(services.email).not.toHaveBeenCalled();
    expect(services.fergus.createLead).not.toHaveBeenCalled();
  });

  it("still redirects to ok even when email and fergus both throw (log is canonical)", async () => {
    const services = buildServices({
      email: vi.fn().mockRejectedValue(new Error("smtp")) as unknown as AppServices["email"],
      fergus: { createLead: vi.fn().mockRejectedValue(new Error("fergus")) },
    });
    setServicesForTest(services);
    const res = await POST({ request: makeForm(validFields), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(303);
    expect(services.log.append).toHaveBeenCalledTimes(1);
  });

  it("returns 500 if the log write itself fails (we can't lose submissions)", async () => {
    setServicesForTest(buildServices({
      log: { append: vi.fn().mockRejectedValue(new Error("disk full")) },
    }));
    const res = await POST({ request: makeForm(validFields), clientAddress: "1.2.3.4" } as Ctx);
    expect(res.status).toBe(500);
  });
});
