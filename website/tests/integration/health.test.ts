import { describe, it, expect } from "vitest";
import { GET } from "../../src/pages/api/health";

describe("GET /api/health", () => {
  it("returns 200 with ok status", async () => {
    const ctx = { request: new Request("http://test/api/health") } as Parameters<typeof GET>[0];
    const res = await GET(ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok" });
    expect(typeof body.ts).toBe("string");
  });
});
