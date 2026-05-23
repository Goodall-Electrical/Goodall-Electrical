# Goodall Electrical Website — Design Spec

**Date:** 2026-05-23
**Owner:** lockie@vysion.com.au
**Status:** Draft — awaiting user review

## Purpose

Build a new marketing website for Goodall Electrical that replaces the existing site at goodallelectrical.com.au. The new site is a complete redesign on a stack the business controls. Primary goals:

1. Generate qualified leads via a structured quote form that pipes directly into Fergus (the business's job-management system).
2. Communicate the breadth of Goodall's services (electrical, AV, automation, communications, antennas) with emphasis on commercial hospitality experience.
3. Be fully deployable as a Docker container behind whatever reverse proxy the business chooses.

## Scope

**In scope:**
- Marketing pages (home, services, projects, about, testimonials, contact)
- Project gallery / portfolio with category filters
- Client testimonials and logo wall
- Online quote request form with file uploads
- Standard contact form
- Form submissions delivered via email **and** posted as a lead to Fergus
- File-edited Markdown content (no CMS)
- Single-container Docker deployment

**Out of scope (explicit):**
- Customer login portal (existing site has one; new site drops it)
- E-commerce / online shop (existing site has one; new site drops it)
- Blog (deferred; content collections will make it trivial to add later)
- Service-area map
- Multi-language support
- Online booking/scheduling

## Audience and tone

- Primary audience: hospitality venue managers (clubs, pubs, hotels), commercial property owners, premium-home owners across the Gippsland region.
- Secondary audience: residential customers needing electrical work.
- Tone: confident tradesman with edge. Less corporate trades-pro, more "specialists who know their craft." Bold Industrial visual direction selected during brainstorming (dark backgrounds, electric yellow accent, strong typography).

## Tech stack

- **Framework:** Astro (latest stable). Static-first with selective server endpoints for form handling. Best fit for a content-heavy marketing site.
- **Styling:** Tailwind CSS with a custom theme matching the Bold Industrial direction (deep black surfaces, off-white text, electric yellow accent, strong sans-serif).
- **Runtime:** Node 22 (Alpine) in production container.
- **Forms:** Zod for validation, server endpoints for submission handling.
- **Email:** SMTP via Nodemailer, or Resend if the business prefers a managed API. Default to SMTP for portability.
- **Fergus integration:** REST client wrapping the Fergus public API for creating new leads/sites/contacts.
- **Image handling:** Astro's built-in `<Image>` component for responsive sizing and lazy loading.
- **Deployment:** Docker container. Multi-stage build. Single port (3000) exposed. Reverse proxy (Caddy, nginx, or Traefik) terminates TLS in production — out of scope for this spec.

## Architecture

```
website/
├── src/
│   ├── pages/
│   │   ├── index.astro              Home
│   │   ├── services/index.astro     Services overview
│   │   ├── services/[slug].astro    Per-service detail
│   │   ├── projects/index.astro     Gallery grid
│   │   ├── projects/[slug].astro    Project detail
│   │   ├── about.astro
│   │   ├── testimonials.astro
│   │   ├── contact.astro
│   │   ├── quote.astro              Structured quote form
│   │   └── api/
│   │       ├── quote.ts             POST endpoint for quote form
│   │       ├── contact.ts           POST endpoint for contact form
│   │       └── health.ts            GET endpoint for container health checks
│   ├── content/
│   │   ├── services/*.md            One file per service
│   │   ├── projects/*.md            One file per project (with images in public/)
│   │   ├── testimonials/*.md        One file per testimonial
│   │   └── config.ts                Zod schemas for collections
│   ├── components/
│   │   ├── layout/                  Header, Footer, Nav
│   │   ├── home/                    Hero, ServicesSnapshot, FeaturedProjects, TestimonialStrip, QuoteCTA
│   │   ├── service/                 ServiceCard, ServiceHero
│   │   ├── project/                 ProjectCard, ProjectGallery, CategoryFilter
│   │   ├── forms/                   QuoteForm, ContactForm, FormField, FileUpload
│   │   └── ui/                      Button, Container, SectionHeading, etc.
│   ├── layouts/
│   │   ├── Base.astro               <html>, <head>, header/footer, theme CSS
│   │   ├── Service.astro
│   │   └── Project.astro
│   ├── lib/
│   │   ├── fergus.ts                Fergus API client
│   │   ├── email.ts                 Email sender (SMTP or Resend)
│   │   ├── quote-handler.ts         Orchestrates email + Fergus + log on form submit
│   │   ├── rate-limit.ts            Simple in-memory rate limiter
│   │   └── log.ts                   Append-only JSONL submission log
│   └── styles/
│       └── global.css               Tailwind directives + theme tokens
├── public/                          Static assets (images, favicons, logos)
├── tests/
│   ├── unit/                        Schema, client, helpers
│   ├── integration/                 API endpoints with mocked deps
│   └── e2e/                         Playwright smoke tests
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── README.md
```

## Page-by-page detail

### Home
Sections (top to bottom):
1. Hero — bold headline + CTA buttons (Get a quote / See our work). Dark background, yellow accent.
2. Services snapshot — five cards (Electrical, AV, Control/Automation, Comms/Networks, Antennas) linking to detail pages.
3. Featured projects — three highlighted gallery items.
4. Trust band — client logos (Sale Greyhound Club, Wonthaggi Workmen's Club, etc.).
5. Testimonial — single rotating quote with attribution.
6. Final CTA — quote form callout with phone number fallback.

### Services pages
Index page lists all services with thumbnails. Each service has its own page with a hero, what-we-do narrative, example work, and a quote CTA. Content sourced from `src/content/services/*.md`.

### Projects (gallery)
Grid layout with category filters (Hospitality, Commercial, Residential). Each card opens a project detail page with photos, scope description, services used, and (optionally) a client quote. Content sourced from `src/content/projects/*.md`. Images live in `public/projects/<slug>/`.

### About
Story, licences (ACN 684 711 224 shown), team photo if available, service area description (Gippsland region in text — no map this round), values.

### Testimonials
Standalone page with a wall of quotes + attributed clients. Content from `src/content/testimonials/*.md`.

### Contact
Phone, email, physical address (if public), simple short-form contact form (name, email, phone, message). Form posts to `/api/contact`.

### Quote
Longer structured form:
- Contact details (name, email, phone)
- Job type (radio: Electrical / AV / Automation / Comms / Antenna / Multiple)
- Site type (Hospitality venue / Commercial / Residential)
- Urgency (Emergency / Within a week / Within a month / Planning ahead)
- Site address
- Description (textarea)
- Optional photo uploads (up to 5, 10MB each, jpg/png/heic)
- Honeypot field for bot detection
Form posts to `/api/quote`.

## Form handling flow

```
client → POST /api/quote (multipart)
   ↓
validate (zod) → reject 400 on bad shape
   ↓
rate-limit check (IP-based, 5/hour) → reject 429
   ↓
honeypot check → silent success
   ↓
quote-handler.ts orchestrates:
   ├── append to JSONL log (synchronous, never fails the request)
   ├── send email to Goodall inbox (async)
   └── POST to Fergus API (async)
   ↓
return 200 with "we've received your request" page
```

**Failure semantics:** Email and Fergus calls run in parallel. If either fails, the other still completes; failures are logged with full context to stderr but the user sees a success page either way. The JSONL log is the canonical record of submissions — even if both downstream calls fail, the submission is not lost.

## Content model

**Service** (Markdown frontmatter):
```yaml
title: Audio Visual
slug: audio-visual
order: 2
heroImage: /services/av-hero.jpg
summary: Short 1-2 sentence summary for cards.
```
Body: free Markdown.

**Project**:
```yaml
title: Sale Greyhound Club AV Upgrade
slug: sale-greyhound-av
client: Sale Greyhound Club
category: hospitality   # one of: hospitality | commercial | residential
services: [audio-visual, electrical]
year: 2024
featured: true
heroImage: /projects/sale-greyhound/hero.jpg
gallery:
  - /projects/sale-greyhound/1.jpg
  - /projects/sale-greyhound/2.jpg
```
Body: free Markdown describing scope.

**Testimonial**:
```yaml
quote: "Goodall did our entire venue refit on time and on budget."
attribution: Manager, Sale Greyhound Club
client: Sale Greyhound Club
order: 1
```

Schemas defined in `src/content/config.ts` using Astro content collections + Zod.

## Docker

**Multi-stage Dockerfile**:
1. **Build stage** — Node 22 Alpine, install deps, run `astro build` → produces `dist/`.
2. **Runtime stage** — Node 22 Alpine slim, copy `dist/`, `node_modules` (production only), `package.json`. Set NODE_ENV=production. Entrypoint: `node ./dist/server/entry.mjs`.

**Image size goal:** under 150MB.

**Configuration (env vars):**
- `PORT` (default 3000)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `GOODALL_INBOX` (where form submissions email to)
- `FERGUS_API_BASE`, `FERGUS_API_KEY`
- `RATE_LIMIT_PER_HOUR` (default 5)
- `SUBMISSION_LOG_PATH` (default /var/log/goodall/submissions.jsonl, volume-mounted)

`.env.example` documents all of these. No secrets in the image or repo.

**docker-compose.yml** provides a one-command dev/test setup with a volume for the submission log.

## Testing

- **Unit tests** (Vitest): Zod schemas, Fergus client (mock fetch), email module, rate limiter, JSONL logger.
- **Integration tests** (Vitest): POST `/api/quote` and `/api/contact` against the Astro dev server with mocked email + Fergus.
- **E2E tests** (Playwright): full page render check for every route, real quote-form submission against a test server with mocked downstreams, accessibility smoke check (axe).
- **Container smoke test**: a script that builds the image, runs it, hits `/`, `/quote`, and `/api/health`, then tears down.

CI is out of scope for this spec but the tests must be runnable locally with a single `pnpm test` (or `npm test`) and a single `./scripts/docker-smoke.sh`.

## Accessibility

- Semantic HTML (header/main/footer/nav).
- Visible focus states styled to match the theme.
- Colour contrast meets WCAG AA on the dark theme (yellow on near-black tested explicitly).
- All images have meaningful alt text (lifted from frontmatter or filename when not specified).
- Forms have associated labels and error messages that are screen-reader announced.

## Performance budget

- Lighthouse Performance score ≥ 90 on mobile for home, a service page, and a project detail page.
- Largest Contentful Paint < 2.5s on a 4G connection.
- Images responsive via Astro `<Image>` (AVIF/WebP with fallback).
- No client-side framework runtime on pages that don't need it (Astro's islands architecture).

## SEO

- Per-page `<title>` and meta description derived from content frontmatter.
- Open Graph + Twitter Card tags on every page.
- JSON-LD `LocalBusiness` schema on the homepage with ACN, phone, service area.
- `sitemap.xml` auto-generated by `@astrojs/sitemap`.
- `robots.txt` allowing all + pointing to sitemap.
- Clean URLs (no `.html` extensions).

## Open questions for user review

1. **SMTP provider** — does Goodall have an existing SMTP service, or should we plan on a transactional provider (Resend, Postmark)? Defaulting to SMTP-configurable means either works.
2. **Domain cutover** — when this is built, will it replace goodallelectrical.com.au directly, or live at a staging subdomain first? Affects when DNS work happens, not the build.
3. **Branding assets** — do you have a current logo file (SVG ideally), brand colours documented, or specific photography? If not, we'll create placeholder marks and use stock photography during build, slotting in real assets when available.
4. **Existing client logos** — do you have permission to display the venue logos shown on the current site (Sale Greyhound Club etc.)? Assumed yes since they're on the current site, but worth confirming.

These don't block writing the implementation plan but should be answered before or during implementation.
