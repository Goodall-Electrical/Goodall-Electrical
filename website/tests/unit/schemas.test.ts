import { describe, it, expect } from "vitest";
import { contactSchema, quoteSchema } from "../../src/lib/schemas";

describe("contactSchema", () => {
  it("accepts a valid contact submission", () => {
    const result = contactSchema.safeParse({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "0400123456",
      message: "Need help with switchboard.",
      _hp: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      phone: "0400123456",
      message: "Hi",
      _hp: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({
      name: "Jane",
      email: "not-an-email",
      phone: "0400123456",
      message: "Hi",
      _hp: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from text fields", () => {
    const result = contactSchema.safeParse({
      name: "  Jane  ",
      email: "jane@example.com",
      phone: "0400123456",
      message: "  Help  ",
      _hp: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jane");
      expect(result.data.message).toBe("Help");
    }
  });
});

describe("quoteSchema", () => {
  const valid = {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "0400123456",
    jobType: "electrical",
    siteType: "hospitality",
    urgency: "within-a-week",
    siteAddress: "1 Main St, Sale VIC",
    description: "Need three-phase install for new bar.",
    _hp: "",
  };

  it("accepts a valid quote submission", () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown jobType", () => {
    expect(quoteSchema.safeParse({ ...valid, jobType: "plumbing" }).success).toBe(false);
  });

  it("rejects an unknown urgency", () => {
    expect(quoteSchema.safeParse({ ...valid, urgency: "tomorrow" }).success).toBe(false);
  });

  it("rejects an unknown siteType", () => {
    expect(quoteSchema.safeParse({ ...valid, siteType: "industrial" }).success).toBe(false);
  });

  it("requires non-empty description", () => {
    expect(quoteSchema.safeParse({ ...valid, description: "" }).success).toBe(false);
  });
});
