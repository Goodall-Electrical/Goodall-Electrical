import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    heroImage: z.string(),
    summary: z.string(),
    cardIcon: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    client: z.string(),
    category: z.enum(["hospitality", "commercial", "residential"]),
    services: z.array(z.string()),
    year: z.number(),
    featured: z.boolean().default(false),
    heroImage: z.string(),
    gallery: z.array(z.string()).default([]),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/testimonials" }),
  schema: z.object({
    quote: z.string(),
    attribution: z.string(),
    client: z.string(),
    order: z.number(),
  }),
});

export const collections = { services, projects, testimonials };
