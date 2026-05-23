import { describe, it, expect, vi } from "vitest";
import { createFergusClient } from "../../src/lib/fergus";

describe("createFergusClient", () => {
  const baseConfig = {
    baseUrl: "https://api.fergus.example",
    apiKey: "test-key",
  };

  it("POSTs the lead to the configured endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"id":"L-1"}', { status: 201 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    const result = await client.createLead({
      name: "Jane",
      email: "jane@x",
      phone: "0400",
      siteAddress: "1 Main",
      description: "Need quote",
      source: "website-quote-form",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api.fergus.example/leads");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["Authorization"]).toBe("Bearer test-key");
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Jane", source: "website-quote-form" });
    expect(result).toEqual({ id: "L-1" });
  });

  it("throws when the API returns a non-2xx", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    await expect(client.createLead({
      name: "Jane", email: "j@x", phone: "0", siteAddress: "x", description: "y", source: "z",
    })).rejects.toThrow(/fergus.*500/i);
  });

  it("throws when the API returns invalid JSON", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("not json", { status: 200 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    await expect(client.createLead({
      name: "Jane", email: "j@x", phone: "0", siteAddress: "x", description: "y", source: "z",
    })).rejects.toThrow();
  });
});
