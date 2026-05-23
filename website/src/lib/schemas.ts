import { z } from "zod";

const trimmed = (min: number, max: number) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(min).max(max));

export const contactSchema = z.object({
  name: trimmed(1, 120),
  email: z.string().email().max(254),
  phone: trimmed(5, 40),
  message: trimmed(1, 5000),
  _hp: z.string().optional().default(""),
});

export const JOB_TYPES = ["electrical", "audio-visual", "automation", "communications", "antenna", "multiple"] as const;
export const SITE_TYPES = ["hospitality", "commercial", "residential"] as const;
export const URGENCY = ["emergency", "within-a-week", "within-a-month", "planning"] as const;

// Optional enum that accepts "" / missing as undefined.
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.enum(values).optional(),
  );

// Optional trimmed string that accepts "" / missing as undefined.
const optionalTrimmed = (max: number) =>
  z.preprocess(
    (v) => {
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim();
      return s === "" ? undefined : s;
    },
    z.string().max(max).optional(),
  );

export const quoteSchema = z.object({
  name: trimmed(1, 120),
  email: z.string().email().max(254),
  phone: trimmed(5, 40),
  jobType: optionalEnum(JOB_TYPES),
  siteType: optionalEnum(SITE_TYPES),
  urgency: optionalEnum(URGENCY),
  siteAddress: optionalTrimmed(500),
  description: trimmed(1, 5000),
  _hp: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
