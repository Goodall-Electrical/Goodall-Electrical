import { z } from "zod";

const trimmed = (min: number, max: number) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(min).max(max));

export const contactSchema = z.object({
  name: trimmed(1, 120),
  email: z.string().email().max(254),
  phone: trimmed(5, 40),
  message: trimmed(1, 5000),
  _hp: z.string().max(0).optional().or(z.literal("")),
});

export const JOB_TYPES = ["electrical", "audio-visual", "automation", "communications", "antenna", "multiple"] as const;
export const SITE_TYPES = ["hospitality", "commercial", "residential"] as const;
export const URGENCY = ["emergency", "within-a-week", "within-a-month", "planning"] as const;

export const quoteSchema = z.object({
  name: trimmed(1, 120),
  email: z.string().email().max(254),
  phone: trimmed(5, 40),
  jobType: z.enum(JOB_TYPES),
  siteType: z.enum(SITE_TYPES),
  urgency: z.enum(URGENCY),
  siteAddress: trimmed(1, 500),
  description: trimmed(1, 5000),
  _hp: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
