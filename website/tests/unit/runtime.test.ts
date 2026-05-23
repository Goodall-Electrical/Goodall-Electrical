import { describe, it, expect } from "vitest";
import { readConfig } from "../../src/lib/runtime";

describe("readConfig", () => {
  it("reads all expected env vars", () => {
    const cfg = readConfig({
      SMTP_HOST: "smtp.example",
      SMTP_PORT: "587",
      SMTP_USER: "u",
      SMTP_PASS: "p",
      SMTP_FROM: "Goodall <no-reply@x.com>",
      GOODALL_INBOX: "office@x.com",
      FERGUS_API_BASE: "https://api.fergus.example",
      FERGUS_API_KEY: "k",
      RATE_LIMIT_PER_HOUR: "10",
      SUBMISSION_LOG_PATH: "/tmp/sub.jsonl",
    });
    expect(cfg.smtp.host).toBe("smtp.example");
    expect(cfg.smtp.port).toBe(587);
    expect(cfg.inbox).toBe("office@x.com");
    expect(cfg.fergus.baseUrl).toBe("https://api.fergus.example");
    expect(cfg.fergus.apiKey).toBe("k");
    expect(cfg.rateLimit).toBe(10);
    expect(cfg.logPath).toBe("/tmp/sub.jsonl");
  });

  it("defaults rateLimit and logPath when unset", () => {
    const cfg = readConfig({
      SMTP_HOST: "h", SMTP_PORT: "25", SMTP_USER: "u", SMTP_PASS: "p", SMTP_FROM: "f@x",
      GOODALL_INBOX: "o@x.com",
      FERGUS_API_BASE: "https://api.example.com", FERGUS_API_KEY: "k",
    });
    expect(cfg.rateLimit).toBe(5);
    expect(cfg.logPath).toBe("/var/log/goodall/submissions.jsonl");
  });

  it("throws on missing required env vars", () => {
    expect(() => readConfig({})).toThrow();
  });
});
