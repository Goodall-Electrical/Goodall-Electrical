import { describe, it, expect, vi } from "vitest";
import { createQuoteHandler } from "../../src/lib/quote-handler";

const validQuote = {
  name: "Jane",
  email: "jane@x.com",
  phone: "0400",
  jobType: "electrical" as const,
  siteType: "hospitality" as const,
  urgency: "within-a-week" as const,
  siteAddress: "1 Main",
  description: "Need quote",
  _hp: "",
};

function build({
  emailOk = true,
  fergusOk = true,
  logAppend = vi.fn().mockResolvedValue(undefined),
} = {}) {
  const sendEmail = vi.fn(emailOk
    ? () => Promise.resolve()
    : () => Promise.reject(new Error("smtp")));
  const createLead = vi.fn(fergusOk
    ? () => Promise.resolve({ id: "L-1" })
    : () => Promise.reject(new Error("fergus")));
  const handler = createQuoteHandler({
    log: { append: logAppend },
    email: sendEmail,
    fergus: { createLead },
    logger: { warn: vi.fn(), error: vi.fn() },
  });
  return { handler, sendEmail, createLead, logAppend };
}

describe("quote handler", () => {
  it("appends to log, sends email, and posts to Fergus on the happy path", async () => {
    const { handler, sendEmail, createLead, logAppend } = build();
    const res = await handler.handle(validQuote);
    expect(logAppend).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(createLead).toHaveBeenCalledTimes(1);
    expect(res.ok).toBe(true);
  });

  it("returns ok=true even when email fails (log + fergus still ran)", async () => {
    const { handler, logAppend, createLead } = build({ emailOk: false });
    const res = await handler.handle(validQuote);
    expect(logAppend).toHaveBeenCalledTimes(1);
    expect(createLead).toHaveBeenCalledTimes(1);
    expect(res.ok).toBe(true);
  });

  it("returns ok=true even when Fergus fails (log + email still ran)", async () => {
    const { handler, logAppend, sendEmail } = build({ fergusOk: false });
    const res = await handler.handle(validQuote);
    expect(logAppend).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(res.ok).toBe(true);
  });

  it("returns ok=true even when both downstreams fail (log is canonical)", async () => {
    const { handler, logAppend } = build({ emailOk: false, fergusOk: false });
    const res = await handler.handle(validQuote);
    expect(logAppend).toHaveBeenCalledTimes(1);
    expect(res.ok).toBe(true);
  });

  it("returns ok=false when log itself fails (we need the canonical record)", async () => {
    const logAppend = vi.fn().mockRejectedValue(new Error("disk full"));
    const { handler } = build({ logAppend });
    const res = await handler.handle(validQuote);
    expect(res.ok).toBe(false);
  });
});
