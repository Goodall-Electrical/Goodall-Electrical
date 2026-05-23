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
  const lines = [
    `Name: ${q.name}`,
    `Email: ${q.email}`,
    `Phone: ${q.phone}`,
  ];
  if (q.jobType)     lines.push(`Job type: ${q.jobType}`);
  if (q.siteType)    lines.push(`Site type: ${q.siteType}`);
  if (q.urgency)     lines.push(`Urgency: ${q.urgency}`);
  if (q.siteAddress) lines.push(`Site address: ${q.siteAddress}`);
  lines.push("", "Description:", q.description);
  return lines.join("\n");
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

      // Fergus has no structured fields for job type / site type / urgency,
      // so they're folded into the description that lands in the enquiry.
      const fergusDescription = [
        input.description,
        "",
        input.jobType  ? `Job type: ${input.jobType}`     : null,
        input.siteType ? `Site type: ${input.siteType}`   : null,
        input.urgency  ? `Urgency: ${input.urgency}`      : null,
      ].filter(Boolean).join("\n");

      const results = await Promise.allSettled([
        deps.email({
          subject: `New quote request — ${input.name}`,
          text: formatBody(input),
        }),
        deps.fergus.createEnquiry({
          name: input.name,
          email: input.email,
          phoneNumber: input.phone,
          description: fergusDescription,
          source: "website-quote-form",
          address1: input.siteAddress?.trim() || "(not provided)",
          addressCity: "Sale",
          addressCountry: "AU",
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
