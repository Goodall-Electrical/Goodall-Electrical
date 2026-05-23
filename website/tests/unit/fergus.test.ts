import { describe, it, expect, vi } from "vitest";
import { createFergusClient } from "../../src/lib/fergus";

describe("createFergusClient", () => {
  const baseConfig = {
    baseUrl: "https://api.fergus.example",
    apiKey: "test-key",
  };

  const minimalEnquiry = {
    name: "Jane",
    email: "jane@x",
    phoneNumber: "0400",
    description: "Need quote",
    source: "website-quote-form",
    address1: "1 Main",
    addressCity: "Sale",
  };

  it("POSTs the enquiry to /enquiries with Bearer auth", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: "success", data: { id: 42 } }), { status: 201 }),
    );
    const client = createFergusClient({ ...baseConfig, fetcher });
    const result = await client.createEnquiry(minimalEnquiry);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api.fergus.example/enquiries");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["Authorization"]).toBe("Bearer test-key");
    expect(JSON.parse(init.body as string)).toMatchObject(minimalEnquiry);
    expect(result).toEqual({ id: 42 });
  });

  it("strips a trailing slash from the baseUrl", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: "success", data: { id: 1 } }), { status: 201 }),
    );
    const client = createFergusClient({ ...baseConfig, baseUrl: "https://api.fergus.example/", fetcher });
    await client.createEnquiry(minimalEnquiry);
    expect(fetcher.mock.calls[0][0]).toBe("https://api.fergus.example/enquiries");
  });

  it("exposes createLead as an alias for createEnquiry (legacy callers)", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: "success", data: { id: 7 } }), { status: 201 }),
    );
    const client = createFergusClient({ ...baseConfig, fetcher });
    const result = await client.createLead(minimalEnquiry);
    expect(result).toEqual({ id: 7 });
  });

  it("throws when the API returns a non-2xx", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    await expect(client.createEnquiry(minimalEnquiry)).rejects.toThrow(/fergus.*500/i);
  });

  it("throws when the API returns invalid JSON", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("not json", { status: 200 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    await expect(client.createEnquiry(minimalEnquiry)).rejects.toThrow();
  });
});
