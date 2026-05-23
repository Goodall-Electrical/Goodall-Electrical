import { z } from "zod";
import { createSubmissionLog, type SubmissionLog } from "./log";
import { createEmailSender, createSmtpMailer, type EmailSender } from "./email";
import { createFergusClient, type FergusClient } from "./fergus";
import { createRateLimiter, type RateLimiter } from "./rate-limit";

const ConfigSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1),
  GOODALL_INBOX: z.string().email(),
  FERGUS_API_BASE: z.string().url(),
  FERGUS_API_KEY: z.string().min(1),
  RATE_LIMIT_PER_HOUR: z.string().regex(/^\d+$/).transform(Number).default("5"),
  SUBMISSION_LOG_PATH: z.string().default("/var/log/goodall/submissions.jsonl"),
});

export interface AppConfig {
  smtp: { host: string; port: number; user: string; pass: string; from: string };
  inbox: string;
  fergus: { baseUrl: string; apiKey: string };
  rateLimit: number;
  logPath: string;
}

export function readConfig(env: Record<string, string | undefined>): AppConfig {
  const parsed = ConfigSchema.parse(env);
  return {
    smtp: {
      host: parsed.SMTP_HOST,
      port: parsed.SMTP_PORT,
      user: parsed.SMTP_USER,
      pass: parsed.SMTP_PASS,
      from: parsed.SMTP_FROM,
    },
    inbox: parsed.GOODALL_INBOX,
    fergus: { baseUrl: parsed.FERGUS_API_BASE, apiKey: parsed.FERGUS_API_KEY },
    rateLimit: parsed.RATE_LIMIT_PER_HOUR,
    logPath: parsed.SUBMISSION_LOG_PATH,
  };
}

export interface AppServices {
  log: SubmissionLog;
  email: EmailSender;
  fergus: FergusClient;
  rateLimiter: RateLimiter;
  logger: { warn: (m: string, meta?: unknown) => void; error: (m: string, meta?: unknown) => void };
}

let cached: AppServices | undefined;

export function getServices(): AppServices {
  if (cached) return cached;
  const cfg = readConfig(process.env);
  const mailer = createSmtpMailer(cfg.smtp);
  cached = {
    log: createSubmissionLog(cfg.logPath),
    email: createEmailSender({ mailer, from: cfg.smtp.from, to: cfg.inbox }),
    fergus: createFergusClient(cfg.fergus),
    rateLimiter: createRateLimiter({ limit: cfg.rateLimit, windowMs: 60 * 60 * 1000 }),
    logger: {
      warn: (msg, meta) => console.warn(msg, meta ?? ""),
      error: (msg, meta) => console.error(msg, meta ?? ""),
    },
  };
  return cached;
}

export function setServicesForTest(s: AppServices): void {
  cached = s;
}

export function resetServicesForTest(): void {
  cached = undefined;
}
