import type { QuoteInput } from "./schemas";
import type { SubmissionLog } from "./log";
import type { EmailSender } from "./email";
import type { FergusClient } from "./fergus";

export interface Logger {
  warn(msg: string, meta?: unknown): void;
  error(msg: string, meta?: unknown): void;
}

export interface QuoteHandlerDeps {
  log: SubmissionLog;
  email: EmailSender;
  fergus: FergusClient;
  logger: Logger;
}

export interface QuoteHandler {
  handle(input: QuoteInput): Promise<{ ok: boolean }>;
}

function formatBody(q: QuoteInput): string {
  return [
    `Name: ${q.name}`,
    `Email: ${q.email}`,
    `Phone: ${q.phone}`,
    `Job type: ${q.jobType}`,
    `Site type: ${q.siteType}`,
    `Urgency: ${q.urgency}`,
    `Site address: ${q.siteAddress}`,
    "",
    "Description:",
    q.description,
  ].join("\n");
}

export function createQuoteHandler(deps: QuoteHandlerDeps): QuoteHandler {
  return {
    async handle(input) {
      try {
        await deps.log.append({ kind: "quote", ...input });
      } catch (err) {
        deps.logger.error("submission log write failed", err);
        return { ok: false };
      }

      const results = await Promise.allSettled([
        deps.email({
          subject: `New quote request — ${input.name}`,
          text: formatBody(input),
        }),
        deps.fergus.createLead({
          name: input.name,
          email: input.email,
          phone: input.phone,
          siteAddress: input.siteAddress,
          description: input.description,
          jobType: input.jobType,
          siteType: input.siteType,
          urgency: input.urgency,
          source: "website-quote-form",
        }),
      ]);

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          const which = i === 0 ? "email" : "fergus";
          deps.logger.warn(`${which} delivery failed`, r.reason);
        }
      });

      return { ok: true };
    },
  };
}
