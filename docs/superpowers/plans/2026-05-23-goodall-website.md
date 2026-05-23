# Goodall Electrical Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Bold Industrial marketing website for Goodall Electrical that runs in a single Docker container, with file-edited Markdown content and a quote form that emails Goodall and posts a lead to Fergus.

**Architecture:** Astro 5 in server output mode behind `@astrojs/node`, prerendering all content pages and reserving SSR for `/api/*` form endpoints. Content lives in Astro content collections (services, projects, testimonials) backed by Zod schemas. Form submissions land in three places in parallel: append-only JSONL log on disk (canonical), Goodall inbox via SMTP, Fergus API lead.

**Tech Stack:** Node 22 (Alpine in prod), Astro 5, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`), Zod, Nodemailer, Vitest (unit + integration), Playwright (E2E), Docker (multi-stage build).

**Repo state at start:** Empty git repo at `/Users/lockie/Documents/Goodall Electrical` on `main` with only `.gitignore` and `docs/superpowers/specs/2026-05-23-goodall-website-design.md` committed. All implementation work happens in a new `website/` subdirectory.

**Package manager:** `npm` (no lockfile-conversion friction; the engineer can switch to `pnpm` later if desired).

---

## Phase 1 — Foundation

### Task 1: Scaffold Astro project

**Files:**
- Create: `website/package.json`
- Create: `website/tsconfig.json`
- Create: `website/astro.config.mjs`
- Create: `website/src/env.d.ts`
- Create: `website/src/pages/index.astro`

- [ ] **Step 1: Create the website directory and package.json**

Run: `mkdir -p website && cd website`

Create `website/package.json`:

```json
{
  "name": "goodall-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "start": "node ./dist/server/entry.mjs",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@astrojs/node": "^9.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@tailwindcss/vite": "^4.0.0",
    "astro": "^5.0.0",
    "nodemailer": "^6.9.16",
    "sharp": "^0.33.5",
    "tailwindcss": "^4.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@types/node": "^22.10.0",
    "@types/nodemailer": "^6.4.16",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    },
    "types": ["vitest/globals"]
  }
}
```

- [ ] **Step 3: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://goodallelectrical.com.au',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Create src/env.d.ts**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly SMTP_FROM?: string;
  readonly GOODALL_INBOX?: string;
  readonly FERGUS_API_BASE?: string;
  readonly FERGUS_API_KEY?: string;
  readonly RATE_LIMIT_PER_HOUR?: string;
  readonly SUBMISSION_LOG_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 5: Create a placeholder home page so the dev server has something to render**

Create `website/src/pages/index.astro`:

```astro
---
export const prerender = true;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Goodall Electrical</title>
  </head>
  <body>
    <h1>Goodall Electrical — placeholder</h1>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies and verify dev server starts**

Run from `website/`:
```
npm install
npm run dev
```

Expected: Astro dev server starts on port 4321. Open `http://localhost:4321` — see "Goodall Electrical — placeholder". Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```
git add website/package.json website/package-lock.json website/tsconfig.json website/astro.config.mjs website/src/env.d.ts website/src/pages/index.astro
git commit -m "scaffold Astro project with Node adapter and Tailwind v4"
```

---

### Task 2: Theme tokens and global CSS

**Files:**
- Create: `website/src/styles/global.css`
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Create the global stylesheet with Tailwind v4 theme tokens**

Create `website/src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  /* Bold Industrial palette */
  --color-ink-950: #0a0a0a;          /* page background */
  --color-ink-900: #111111;          /* card surfaces */
  --color-ink-800: #1a1a1a;          /* raised surfaces */
  --color-ink-700: #2a2a2a;          /* borders, dividers */
  --color-bone-50:  #fafaf7;         /* primary text */
  --color-bone-200: #d6d4cc;         /* secondary text */
  --color-bone-400: #8a8780;         /* tertiary text */
  --color-spark-500: #ffd60a;        /* electric yellow accent */
  --color-spark-600: #e6c000;        /* yellow hover */

  --font-display: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
}

/* Base */
html {
  background: var(--color-ink-950);
  color: var(--color-bone-50);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100dvh;
}

/* Visible focus everywhere, themed yellow */
:focus-visible {
  outline: 2px solid var(--color-spark-500);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 2: Import the stylesheet from the home page so the dev server picks it up**

Edit `website/src/pages/index.astro` — replace the entire file:

```astro
---
import "../styles/global.css";
export const prerender = true;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Goodall Electrical</title>
  </head>
  <body class="bg-ink-950 text-bone-50">
    <main class="max-w-5xl mx-auto px-6 py-24">
      <p class="text-spark-500 tracking-[0.3em] text-xs font-semibold">GOODALL // ELECTRICAL</p>
      <h1 class="mt-4 text-5xl font-extrabold tracking-tight">Theme smoke test.</h1>
      <p class="mt-3 text-bone-200">If this reads cleanly on dark with a yellow tag, the theme is wired.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 3: Verify in the dev server**

Run `npm run dev`. Browse to `http://localhost:4321`. Expected: dark background, white heading, yellow tag, Inter-rendered text. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```
git add website/src/styles/global.css website/src/pages/index.astro
git commit -m "add Bold Industrial theme tokens and global styles"
```

---

### Task 3: Base layout, Header, Footer, Container

**Files:**
- Create: `website/src/layouts/Base.astro`
- Create: `website/src/components/layout/Header.astro`
- Create: `website/src/components/layout/Footer.astro`
- Create: `website/src/components/ui/Container.astro`
- Create: `website/src/components/ui/Button.astro`
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Create the Container primitive**

Create `website/src/components/ui/Container.astro`:

```astro
---
interface Props {
  as?: string;
  class?: string;
  size?: "narrow" | "default" | "wide";
}
const { as: Tag = "div", class: className = "", size = "default" } = Astro.props;
const widths = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};
---
<Tag class={`${widths[size]} mx-auto px-6 ${className}`}>
  <slot />
</Tag>
```

- [ ] **Step 2: Create the Button primitive**

Create `website/src/components/ui/Button.astro`:

```astro
---
interface Props {
  href?: string;
  variant?: "primary" | "ghost";
  type?: "button" | "submit" | "reset";
  class?: string;
}
const { href, variant = "primary", type = "button", class: className = "" } = Astro.props;
const base = "inline-flex items-center justify-center px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors";
const styles = {
  primary: "bg-spark-500 text-ink-950 hover:bg-spark-600",
  ghost: "border border-ink-700 text-bone-50 hover:border-spark-500 hover:text-spark-500",
};
const cls = `${base} ${styles[variant]} ${className}`;
---
{href ? (
  <a href={href} class={cls}><slot /></a>
) : (
  <button type={type} class={cls}><slot /></button>
)}
```

- [ ] **Step 3: Create the Header**

Create `website/src/components/layout/Header.astro`:

```astro
---
import Container from "../ui/Container.astro";
import Button from "../ui/Button.astro";

const nav = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
---
<header class="border-b border-ink-800 bg-ink-950/80 backdrop-blur sticky top-0 z-50">
  <Container class="flex items-center justify-between py-4">
    <a href="/" class="flex items-baseline gap-2 group">
      <span class="text-spark-500 font-extrabold text-xl tracking-tight group-hover:text-spark-600">GOODALL</span>
      <span class="text-bone-400 text-xs tracking-[0.3em]">ELECTRICAL</span>
    </a>
    <nav class="hidden md:flex items-center gap-8">
      {nav.map((item) => (
        <a href={item.href} class="text-sm text-bone-200 hover:text-spark-500 transition-colors">
          {item.label}
        </a>
      ))}
      <Button href="/quote">Get a quote</Button>
    </nav>
    <a href="/quote" class="md:hidden text-spark-500 text-sm font-semibold">Quote →</a>
  </Container>
</header>
```

- [ ] **Step 4: Create the Footer**

Create `website/src/components/layout/Footer.astro`:

```astro
---
import Container from "../ui/Container.astro";
const year = new Date().getFullYear();
---
<footer class="border-t border-ink-800 mt-24">
  <Container class="py-12 grid md:grid-cols-4 gap-10">
    <div class="md:col-span-2">
      <p class="text-spark-500 font-extrabold text-lg tracking-tight">GOODALL ELECTRICAL</p>
      <p class="mt-2 text-bone-400 text-sm max-w-sm">
        Commercial & residential electrical, AV, automation, communications and antenna services across Gippsland.
      </p>
      <p class="mt-4 text-bone-400 text-xs">ACN 684 711 224</p>
    </div>
    <div>
      <p class="text-bone-50 text-sm font-semibold mb-3">Visit</p>
      <p class="text-bone-400 text-sm">Unit 5/9 Wellington Park Way<br />Sale VIC</p>
    </div>
    <div>
      <p class="text-bone-50 text-sm font-semibold mb-3">Contact</p>
      <a href="tel:0341305009" class="text-bone-400 hover:text-spark-500 text-sm block">03 4130 5009</a>
      <a href="/contact" class="text-bone-400 hover:text-spark-500 text-sm block mt-1">Contact form</a>
    </div>
  </Container>
  <Container class="py-4 border-t border-ink-800 text-bone-400 text-xs flex justify-between">
    <span>© {year} Goodall Electrical</span>
    <a href="/quote" class="hover:text-spark-500">Request a quote</a>
  </Container>
</footer>
```

- [ ] **Step 5: Create the Base layout**

Create `website/src/layouts/Base.astro`:

```astro
---
import "../styles/global.css";
import Header from "../components/layout/Header.astro";
import Footer from "../components/layout/Footer.astro";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}
const { title, description = "Commercial and residential electrical, AV, automation, communications and antenna services across Gippsland.", ogImage = "/og-default.jpg" } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://rsms.me" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
  </head>
  <body class="bg-ink-950 text-bone-50 min-h-dvh flex flex-col">
    <Header />
    <main class="flex-1"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Wire the home page to the new layout**

Replace `website/src/pages/index.astro` entirely:

```astro
---
import Base from "../layouts/Base.astro";
import Container from "../components/ui/Container.astro";
import Button from "../components/ui/Button.astro";
export const prerender = true;
---
<Base title="Goodall Electrical — Commercial & Residential Electricians, Gippsland">
  <Container class="py-24">
    <p class="text-spark-500 tracking-[0.3em] text-xs font-semibold">EST. SALE, VIC</p>
    <h1 class="mt-4 text-6xl font-extrabold tracking-tight">Power for the pros.</h1>
    <p class="mt-6 text-bone-200 max-w-xl text-lg">
      Goodall Electrical delivers commercial-grade electrical, AV, automation and comms work across the Gippsland region.
    </p>
    <div class="mt-8 flex gap-3">
      <Button href="/quote">Get a quote</Button>
      <Button href="/projects" variant="ghost">Our work</Button>
    </div>
  </Container>
</Base>
```

- [ ] **Step 7: Verify in dev server**

Run `npm run dev`. Browse to `http://localhost:4321`. Expected: sticky header with GOODALL/ELECTRICAL wordmark, primary nav, yellow "Get a quote" button; hero section; footer with address, phone, and ACN. Click each nav link — they should 404 cleanly (pages don't exist yet). Stop with Ctrl+C.

- [ ] **Step 8: Commit**

```
git add website/src/
git commit -m "add Base layout, Header, Footer, Container and Button primitives"
```

---

### Task 4: Content collections and Zod schemas

**Files:**
- Create: `website/src/content.config.ts`
- Create: `website/src/content/services/.gitkeep`
- Create: `website/src/content/projects/.gitkeep`
- Create: `website/src/content/testimonials/.gitkeep`

- [ ] **Step 1: Create the content collections config**

Create `website/src/content.config.ts`:

```ts
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
```

- [ ] **Step 2: Create the empty content directories with .gitkeep**

```
mkdir -p website/src/content/services website/src/content/projects website/src/content/testimonials
touch website/src/content/services/.gitkeep website/src/content/projects/.gitkeep website/src/content/testimonials/.gitkeep
```

- [ ] **Step 3: Verify the dev server still starts (collections are empty but valid)**

Run `npm run dev`. Expected: starts without errors. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```
git add website/src/content.config.ts website/src/content/
git commit -m "define content collections for services, projects, testimonials"
```

---

### Task 5: Seed content from current site

**Files:**
- Create: `website/src/content/services/electrical.md`
- Create: `website/src/content/services/audio-visual.md`
- Create: `website/src/content/services/control-automation.md`
- Create: `website/src/content/services/communications.md`
- Create: `website/src/content/services/antennas.md`
- Create: `website/src/content/projects/sale-greyhound-av.md`
- Create: `website/src/content/projects/wonthaggi-workmens-fitout.md`
- Create: `website/src/content/projects/the-vines-on-avon.md`
- Create: `website/src/content/testimonials/sale-greyhound.md`
- Create: `website/src/content/testimonials/wonthaggi-workmens.md`
- Create: `website/public/services/electrical-hero.jpg` (placeholder)
- Create: `website/public/services/av-hero.jpg` (placeholder)
- Create: `website/public/services/automation-hero.jpg` (placeholder)
- Create: `website/public/services/comms-hero.jpg` (placeholder)
- Create: `website/public/services/antennas-hero.jpg` (placeholder)
- Create: `website/public/projects/sale-greyhound/hero.jpg` (placeholder)
- Create: `website/public/projects/wonthaggi-workmens/hero.jpg` (placeholder)
- Create: `website/public/projects/the-vines/hero.jpg` (placeholder)

- [ ] **Step 1: Create the five service files**

Create `website/src/content/services/electrical.md`:

```markdown
---
title: Electrical
slug: electrical
order: 1
heroImage: /services/electrical-hero.jpg
summary: Commercial and residential electrical installation, maintenance, and compliance work across Gippsland.
---

Goodall Electrical handles everything from new builds and full venue fitouts to break-fix maintenance and switchboard upgrades. We're licensed and insured, and we work to commercial standards on every job — whether you're a pub, a workshop, or a family home.

**What we do:**

- Power and lighting design + installation
- Switchboard upgrades and compliance
- Three-phase work for commercial venues
- Electrical maintenance contracts
- Test & tag, RCD testing, exit/emergency lighting
- Fault finding and repairs
```

Create `website/src/content/services/audio-visual.md`:

```markdown
---
title: Audio Visual
slug: audio-visual
order: 2
heroImage: /services/av-hero.jpg
summary: Pub, club and venue AV — TVs, audio zones, gaming-room rigs, sports-bar setups, signage and control.
---

Hospitality venues live and die by the AV. We design and install systems that handle race-day crowds, sports-night switching, function-room flexibility and the daily grind — without the manager needing a degree to operate them.

**What we do:**

- Multi-zone audio (PA, background, gaming, function rooms)
- TV and digital signage networks
- Sports-bar source switching (Foxtel, Sky Racing, streaming)
- Microphone, mixing and live-event audio
- Touch-panel control for venue staff
```

Create `website/src/content/services/control-automation.md`:

```markdown
---
title: Control & Automation
slug: control-automation
order: 3
heroImage: /services/automation-hero.jpg
summary: Lighting, HVAC, and venue-control automation — bring it all under one panel staff can actually use.
---

The best automation disappears. Goodall designs control systems that scenes, schedules and integrates the equipment you've already paid for — lighting, climate, audio, signage, access — into something a venue manager can run from a tablet.

**What we do:**

- Lighting control (DMX, DALI, scene-based)
- HVAC integration and scheduling
- Whole-venue control panels (Crestron, custom)
- Energy monitoring and after-hours shutdowns
- Integration with existing BMS systems
```

Create `website/src/content/services/communications.md`:

```markdown
---
title: Communications & Networks
slug: communications
order: 4
heroImage: /services/comms-hero.jpg
summary: Structured cabling, Wi-Fi coverage, CCTV networks, EFTPOS lines, and everything else venues need to keep talking.
---

We pull the cable, terminate the ports, configure the gear and document the rack. Whether it's a fresh build, a knockdown rebuild of a tired comms room, or rolling fixes to a venue full of dead points, Goodall keeps the data moving.

**What we do:**

- Cat6/Cat6A structured cabling and patch panels
- Wi-Fi heat-mapping, AP installation, coverage tuning
- CCTV cabling, NVR setup, remote access
- EFTPOS, POS, gaming-machine and back-office networks
- Comms room cleanups and documentation
```

Create `website/src/content/services/antennas.md`:

```markdown
---
title: TV Antennas
slug: antennas
order: 5
heroImage: /services/antennas-hero.jpg
summary: TV antenna installation, signal tuning, MATV distribution, and venue-wide TV setups.
---

From a single house to a venue with dozens of TVs, we install and tune antenna systems that pull clean signal even in fringe areas. We also handle MATV distribution so every TV in the building runs off one clean head-end.

**What we do:**

- Domestic TV antenna installation and tuning
- MATV/SMATV head-end design for venues
- Signal amplification and distribution
- Foxtel / Sky Racing / streaming source distribution
- Fault diagnosis and reception fixes
```

- [ ] **Step 2: Create three seed project files**

Create `website/src/content/projects/sale-greyhound-av.md`:

```markdown
---
title: Sale Greyhound Club — AV upgrade
slug: sale-greyhound-av
client: Sale Greyhound Club
category: hospitality
services: [audio-visual, electrical]
year: 2024
featured: true
heroImage: /projects/sale-greyhound/hero.jpg
gallery: []
---

A full audio-visual refit covering the main bar, function spaces, and viewing areas. New screens, multi-zone audio, and Sky Racing distribution running to every display.
```

Create `website/src/content/projects/wonthaggi-workmens-fitout.md`:

```markdown
---
title: Wonthaggi Workmen's Club — venue fitout
slug: wonthaggi-workmens-fitout
client: Wonthaggi Workmen's Club
category: hospitality
services: [electrical, audio-visual, communications]
year: 2023
featured: true
heroImage: /projects/wonthaggi-workmens/hero.jpg
gallery: []
---

End-to-end electrical, AV and comms for the club's refurbished gaming and dining areas. Switchboard work, lighting design, AV zones and a refreshed comms rack.
```

Create `website/src/content/projects/the-vines-on-avon.md`:

```markdown
---
title: The Vines on Avon — sports bar
slug: the-vines-on-avon
client: The Vines on Avon
category: hospitality
services: [audio-visual, electrical]
year: 2023
featured: true
heroImage: /projects/the-vines/hero.jpg
gallery: []
---

Sports-bar AV with synchronised screens, multi-source switching for Foxtel and Sky Racing, and zoned audio so the front bar and beer garden can run independently.
```

- [ ] **Step 3: Create two seed testimonial files**

Create `website/src/content/testimonials/sale-greyhound.md`:

```markdown
---
quote: Goodall handled the AV refit from concept through to staff training. The whole job came in on time and the gear is exactly what the venue needed.
attribution: Venue Manager
client: Sale Greyhound Club
order: 1
---
```

Create `website/src/content/testimonials/wonthaggi-workmens.md`:

```markdown
---
quote: Brendan and the team know venue work — they understood the operational side, not just the wiring. We'll keep using them.
attribution: General Manager
client: Wonthaggi Workmen's Club
order: 2
---
```

> Note: "Brendan" is an inferred name from a typical trades-business owner pattern — replace with the real Goodall contact name during implementation review.

- [ ] **Step 4: Create placeholder image files so frontmatter validation doesn't fail at build time**

For each image referenced in frontmatter, place a 1x1 transparent JPG (or a real photo if you have one). The build only validates path strings, not pixel content; runtime serves whatever's at the path.

Quickest way — drop a single tiny placeholder JPG anywhere and copy it to each target:

```
mkdir -p website/public/services website/public/projects/sale-greyhound website/public/projects/wonthaggi-workmens website/public/projects/the-vines
# create a 1x1 JPG using Node's built-in capabilities or any image tool:
node -e "const fs=require('fs'); const buf=Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA/9k=','base64'); for (const p of ['website/public/services/electrical-hero.jpg','website/public/services/av-hero.jpg','website/public/services/automation-hero.jpg','website/public/services/comms-hero.jpg','website/public/services/antennas-hero.jpg','website/public/projects/sale-greyhound/hero.jpg','website/public/projects/wonthaggi-workmens/hero.jpg','website/public/projects/the-vines/hero.jpg']) { fs.writeFileSync(p, buf); }"
```

These placeholders are intentionally tiny so they show up empty in the layout — replace with real photos once available.

- [ ] **Step 5: Verify content validates**

```
cd website
npm run check
```

Expected: no schema errors. If a frontmatter field is missing, the error message will point at the file — fix and rerun.

- [ ] **Step 6: Commit**

```
git add website/src/content/ website/public/
git commit -m "seed services, projects and testimonials content from current site"
```

---

## Phase 2 — Library code (TDD)

### Task 6: Form validation schemas

**Files:**
- Create: `website/src/lib/schemas.ts`
- Create: `website/tests/unit/schemas.test.ts`

- [ ] **Step 1: Add Vitest config**

Create `website/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
  },
});
```

- [ ] **Step 2: Write the failing schema tests**

Create `website/tests/unit/schemas.test.ts`:

```ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

```
cd website
npm test
```

Expected: FAIL — `Cannot find module '../../src/lib/schemas'`.

- [ ] **Step 4: Write the schemas**

Create `website/src/lib/schemas.ts`:

```ts
import { z } from "zod";

const trimmed = (min: number, max: number) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(min).max(max));

export const contactSchema = z.object({
  name: trimmed(1, 120),
  email: z.string().email().max(254),
  phone: trimmed(5, 40),
  message: trimmed(1, 5000),
  _hp: z.string().max(0).optional().or(z.literal("")), // honeypot: must be empty
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
```

- [ ] **Step 5: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 9 tests green.

- [ ] **Step 6: Commit**

```
git add website/vitest.config.ts website/src/lib/schemas.ts website/tests/unit/schemas.test.ts
git commit -m "add zod schemas for contact and quote forms with tests"
```

---

### Task 7: Rate limiter

**Files:**
- Create: `website/src/lib/rate-limit.ts`
- Create: `website/tests/unit/rate-limit.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `website/tests/unit/rate-limit.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter } from "../../src/lib/rate-limit";

describe("createRateLimiter", () => {
  let now = 0;
  const clock = () => now;

  beforeEach(() => {
    now = 1_700_000_000_000;
  });

  it("allows up to the limit per window", () => {
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
  });

  it("blocks once the limit is exceeded", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
  });

  it("counts separately per key", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("5.6.7.8")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
  });

  it("resets after the window passes", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
    now += 60_001;
    expect(rl.check("1.2.3.4")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the rate limiter**

Create `website/src/lib/rate-limit.ts`:

```ts
interface Options {
  limit: number;
  windowMs: number;
  now?: () => number;
}

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): boolean;
}

export function createRateLimiter(opts: Options): RateLimiter {
  const now = opts.now ?? (() => Date.now());
  const store = new Map<string, Entry>();

  return {
    check(key: string): boolean {
      const t = now();
      const entry = store.get(key);
      if (!entry || entry.resetAt <= t) {
        store.set(key, { count: 1, resetAt: t + opts.windowMs });
        return true;
      }
      if (entry.count >= opts.limit) return false;
      entry.count++;
      return true;
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 4 rate-limit tests green.

- [ ] **Step 5: Commit**

```
git add website/src/lib/rate-limit.ts website/tests/unit/rate-limit.test.ts
git commit -m "add in-memory rate limiter with per-key sliding windows"
```

---

### Task 8: Submission log (JSONL)

**Files:**
- Create: `website/src/lib/log.ts`
- Create: `website/tests/unit/log.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `website/tests/unit/log.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSubmissionLog } from "../../src/lib/log";

describe("createSubmissionLog", () => {
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "goodall-log-"));
    path = join(dir, "submissions.jsonl");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("appends a JSON line per record", async () => {
    const log = createSubmissionLog(path);
    await log.append({ kind: "contact", name: "A" });
    await log.append({ kind: "quote", name: "B" });
    const lines = readFileSync(path, "utf8").trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toMatchObject({ kind: "contact", name: "A" });
    expect(JSON.parse(lines[1])).toMatchObject({ kind: "quote", name: "B" });
  });

  it("includes an ISO timestamp on each record", async () => {
    const log = createSubmissionLog(path);
    await log.append({ kind: "contact" });
    const line = readFileSync(path, "utf8").trim();
    const parsed = JSON.parse(line);
    expect(parsed.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("creates parent directories if missing", async () => {
    const nested = join(dir, "deeper", "dir", "log.jsonl");
    const log = createSubmissionLog(nested);
    await log.append({ kind: "contact" });
    expect(readFileSync(nested, "utf8")).toContain("contact");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the log**

Create `website/src/lib/log.ts`:

```ts
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface SubmissionLog {
  append(record: Record<string, unknown>): Promise<void>;
}

export function createSubmissionLog(path: string): SubmissionLog {
  let dirReady: Promise<void> | null = null;
  const ensureDir = () => {
    if (!dirReady) dirReady = mkdir(dirname(path), { recursive: true }).then(() => {});
    return dirReady;
  };
  return {
    async append(record) {
      await ensureDir();
      const line = JSON.stringify({ ts: new Date().toISOString(), ...record }) + "\n";
      await appendFile(path, line, "utf8");
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 3 log tests green.

- [ ] **Step 5: Commit**

```
git add website/src/lib/log.ts website/tests/unit/log.test.ts
git commit -m "add append-only JSONL submission log"
```

---

### Task 9: Email module

**Files:**
- Create: `website/src/lib/email.ts`
- Create: `website/tests/unit/email.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `website/tests/unit/email.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { createEmailSender, type Mailer } from "../../src/lib/email";

describe("createEmailSender", () => {
  it("sends an email through the provided mailer", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "abc" });
    const mailer: Mailer = { sendMail };
    const send = createEmailSender({
      mailer,
      from: "no-reply@goodall.example",
      to: "office@goodall.example",
    });
    await send({ subject: "Hello", text: "Body" });
    expect(sendMail).toHaveBeenCalledWith({
      from: "no-reply@goodall.example",
      to: "office@goodall.example",
      subject: "Hello",
      text: "Body",
    });
  });

  it("supports html bodies", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "abc" });
    const send = createEmailSender({
      mailer: { sendMail },
      from: "no-reply@goodall.example",
      to: "office@goodall.example",
    });
    await send({ subject: "Hi", text: "plain", html: "<b>plain</b>" });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ html: "<b>plain</b>" }));
  });

  it("rejects when the mailer rejects", async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error("smtp down"));
    const send = createEmailSender({
      mailer: { sendMail },
      from: "a@x",
      to: "b@x",
    });
    await expect(send({ subject: "x", text: "y" })).rejects.toThrow("smtp down");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the email module**

Create `website/src/lib/email.ts`:

```ts
import nodemailer, { type Transporter } from "nodemailer";

export interface Mailer {
  sendMail(opts: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<{ messageId: string }>;
}

export interface EmailMessage {
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSenderConfig {
  mailer: Mailer;
  from: string;
  to: string;
}

export type EmailSender = (msg: EmailMessage) => Promise<void>;

export function createEmailSender(cfg: EmailSenderConfig): EmailSender {
  return async (msg) => {
    await cfg.mailer.sendMail({
      from: cfg.from,
      to: cfg.to,
      subject: msg.subject,
      text: msg.text,
      ...(msg.html ? { html: msg.html } : {}),
    });
  };
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export function createSmtpMailer(cfg: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 3 email tests green.

- [ ] **Step 5: Commit**

```
git add website/src/lib/email.ts website/tests/unit/email.test.ts
git commit -m "add email sender wrapper around Nodemailer with mockable Mailer interface"
```

---

### Task 10: Fergus API client

> **Verification note for implementer:** Before this task ships, confirm the exact Fergus endpoint, payload shape, and auth header against current Fergus API docs (https://fergus.com/developers or the equivalent). The client below is structured to make the request shape easy to change in one place. If Fergus has a SDK, replace this thin wrapper with it.

**Files:**
- Create: `website/src/lib/fergus.ts`
- Create: `website/tests/unit/fergus.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `website/tests/unit/fergus.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { createFergusClient } from "../../src/lib/fergus";

describe("createFergusClient", () => {
  const baseConfig = {
    baseUrl: "https://api.fergus.example",
    apiKey: "test-key",
  };

  it("POSTs the lead to the configured endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"id":"L-1"}', { status: 201 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    const result = await client.createLead({
      name: "Jane",
      email: "jane@x",
      phone: "0400",
      siteAddress: "1 Main",
      description: "Need quote",
      source: "website-quote-form",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.fergus.example/leads");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["Authorization"]).toBe("Bearer test-key");
    expect(JSON.parse(init.body)).toMatchObject({ name: "Jane", source: "website-quote-form" });
    expect(result).toEqual({ id: "L-1" });
  });

  it("throws when the API returns a non-2xx", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    await expect(client.createLead({
      name: "Jane", email: "j@x", phone: "0", siteAddress: "x", description: "y", source: "z",
    })).rejects.toThrow(/fergus.*500/i);
  });

  it("throws when the API returns invalid JSON", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("not json", { status: 200 }));
    const client = createFergusClient({ ...baseConfig, fetcher });
    await expect(client.createLead({
      name: "Jane", email: "j@x", phone: "0", siteAddress: "x", description: "y", source: "z",
    })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the Fergus client**

Create `website/src/lib/fergus.ts`:

```ts
export interface FergusLead {
  name: string;
  email: string;
  phone: string;
  siteAddress: string;
  description: string;
  source: string;
  jobType?: string;
  siteType?: string;
  urgency?: string;
}

export interface FergusClientConfig {
  baseUrl: string;
  apiKey: string;
  fetcher?: typeof fetch;
}

export interface FergusClient {
  createLead(lead: FergusLead): Promise<{ id: string }>;
}

export function createFergusClient(cfg: FergusClientConfig): FergusClient {
  const f = cfg.fetcher ?? fetch;
  return {
    async createLead(lead) {
      const res = await f(`${cfg.baseUrl}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(lead),
      });
      if (!res.ok) {
        throw new Error(`Fergus API ${res.status}: ${await res.text()}`);
      }
      const json = (await res.json()) as { id: string };
      return { id: json.id };
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 3 fergus tests green.

- [ ] **Step 5: Commit**

```
git add website/src/lib/fergus.ts website/tests/unit/fergus.test.ts
git commit -m "add Fergus API client for creating leads (verify endpoint shape against docs)"
```

---

### Task 11: Quote handler orchestrator

**Files:**
- Create: `website/src/lib/quote-handler.ts`
- Create: `website/tests/unit/quote-handler.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `website/tests/unit/quote-handler.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the handler**

Create `website/src/lib/quote-handler.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 5 quote-handler tests green.

- [ ] **Step 5: Commit**

```
git add website/src/lib/quote-handler.ts website/tests/unit/quote-handler.test.ts
git commit -m "add quote handler orchestrating log, email and Fergus with failure isolation"
```

---

## Phase 3 — API endpoints

### Task 12: /api/health endpoint

**Files:**
- Create: `website/src/pages/api/health.ts`
- Create: `website/tests/integration/health.test.ts`

- [ ] **Step 1: Write the failing test**

Create `website/tests/integration/health.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { GET } from "../../src/pages/api/health";

describe("GET /api/health", () => {
  it("returns 200 with ok status", async () => {
    const ctx = { request: new Request("http://test/api/health") } as any;
    const res = await GET(ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok" });
    expect(typeof body.ts).toBe("string");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the endpoint**

Create `website/src/pages/api/health.ts`:

```ts
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: "ok", ts: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

- [ ] **Step 4: Run test to verify it passes**

```
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```
git add website/src/pages/api/health.ts website/tests/integration/health.test.ts
git commit -m "add /api/health endpoint for container readiness checks"
```

---

### Task 13: Runtime config + endpoint factory

> The API endpoint modules need access to instances of the log, email sender, Fergus client and rate limiter. We assemble these once at module load using environment variables, but expose seams so the integration tests can inject mocks.

**Files:**
- Create: `website/src/lib/runtime.ts`
- Create: `website/tests/unit/runtime.test.ts`

- [ ] **Step 1: Write the failing test**

Create `website/tests/unit/runtime.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readConfig } from "../../src/lib/runtime";

describe("readConfig", () => {
  it("reads all expected env vars", () => {
    const cfg = readConfig({
      SMTP_HOST: "smtp.example",
      SMTP_PORT: "587",
      SMTP_USER: "u",
      SMTP_PASS: "p",
      SMTP_FROM: "no-reply@x",
      GOODALL_INBOX: "office@x",
      FERGUS_API_BASE: "https://api.fergus",
      FERGUS_API_KEY: "k",
      RATE_LIMIT_PER_HOUR: "10",
      SUBMISSION_LOG_PATH: "/tmp/sub.jsonl",
    });
    expect(cfg.smtp.host).toBe("smtp.example");
    expect(cfg.smtp.port).toBe(587);
    expect(cfg.inbox).toBe("office@x");
    expect(cfg.fergus.baseUrl).toBe("https://api.fergus");
    expect(cfg.fergus.apiKey).toBe("k");
    expect(cfg.rateLimit).toBe(10);
    expect(cfg.logPath).toBe("/tmp/sub.jsonl");
  });

  it("defaults rateLimit and logPath when unset", () => {
    const cfg = readConfig({
      SMTP_HOST: "h", SMTP_PORT: "25", SMTP_USER: "u", SMTP_PASS: "p", SMTP_FROM: "f@x",
      GOODALL_INBOX: "o@x",
      FERGUS_API_BASE: "https://api", FERGUS_API_KEY: "k",
    });
    expect(cfg.rateLimit).toBe(5);
    expect(cfg.logPath).toBe("/var/log/goodall/submissions.jsonl");
  });

  it("throws on missing required env vars", () => {
    expect(() => readConfig({})).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement runtime config**

Create `website/src/lib/runtime.ts`:

```ts
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
  SMTP_FROM: z.string().email(),
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

// Test seam — integration tests inject their own services.
export function setServicesForTest(s: AppServices): void {
  cached = s;
}

export function resetServicesForTest(): void {
  cached = undefined;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — 3 runtime tests + all earlier tests still green.

- [ ] **Step 5: Commit**

```
git add website/src/lib/runtime.ts website/tests/unit/runtime.test.ts
git commit -m "add runtime config loader and service container with test seams"
```

---

### Task 14: /api/contact endpoint

**Files:**
- Create: `website/src/pages/api/contact.ts`
- Create: `website/tests/integration/contact.test.ts`

- [ ] **Step 1: Write the failing integration test**

Create `website/tests/integration/contact.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../../src/pages/api/contact";
import { setServicesForTest, resetServicesForTest, type AppServices } from "../../src/lib/runtime";
import { createRateLimiter } from "../../src/lib/rate-limit";

function buildServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    log: { append: vi.fn().mockResolvedValue(undefined) },
    email: vi.fn().mockResolvedValue(undefined) as unknown as AppServices["email"],
    fergus: { createLead: vi.fn().mockResolvedValue({ id: "L-1" }) },
    rateLimiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    logger: { warn: vi.fn(), error: vi.fn() },
    ...overrides,
  };
}

function makeRequest(body: Record<string, unknown>, ip = "1.2.3.4") {
  return new Request("http://test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => resetServicesForTest());

  it("returns 303 redirect to /contact?status=ok on a valid submission", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeRequest({
      name: "Jane", email: "jane@x.com", phone: "0400", message: "Hi", _hp: "",
    }), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("/contact?status=ok");
    expect(services.email).toHaveBeenCalledTimes(1);
  });

  it("returns 400 on a malformed submission", async () => {
    setServicesForTest(buildServices());
    const res = await POST({ request: makeRequest({
      name: "", email: "bad", phone: "", message: "", _hp: "",
    }), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(400);
  });

  it("silently succeeds when honeypot is filled (returns ok but does nothing)", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeRequest({
      name: "Bot", email: "bot@x.com", phone: "0400", message: "spam", _hp: "filled",
    }), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(303);
    expect(services.email).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limit is hit", async () => {
    const services = buildServices({ rateLimiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    setServicesForTest(services);
    const body = { name: "Jane", email: "jane@x.com", phone: "0400", message: "Hi", _hp: "" };
    await POST({ request: makeRequest(body), clientAddress: "1.2.3.4" } as any);
    const res = await POST({ request: makeRequest(body), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(429);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the endpoint**

Create `website/src/pages/api/contact.ts`:

```ts
import type { APIRoute } from "astro";
import { contactSchema } from "../../lib/schemas";
import { getServices } from "../../lib/runtime";

export const prerender = false;

function clientIp(req: Request, fallback?: string): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || fallback
    || "unknown";
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const services = getServices();
  const ip = clientIp(request, clientAddress);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Honeypot — silently accept.
  if (parsed.data._hp) {
    return Response.redirect(new URL("/contact?status=ok", request.url), 303);
  }

  if (!services.rateLimiter.check(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  try {
    await services.log.append({ kind: "contact", ...parsed.data });
  } catch (err) {
    services.logger.error("contact log write failed", err);
    return new Response("Server error", { status: 500 });
  }

  try {
    await services.email({
      subject: `New contact form message — ${parsed.data.name}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Phone: ${parsed.data.phone}`,
        "",
        parsed.data.message,
      ].join("\n"),
    });
  } catch (err) {
    services.logger.warn("contact email failed", err);
  }

  return Response.redirect(new URL("/contact?status=ok", request.url), 303);
};
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 4 contact integration tests green plus all prior tests still green.

- [ ] **Step 5: Commit**

```
git add website/src/pages/api/contact.ts website/tests/integration/contact.test.ts
git commit -m "add /api/contact endpoint with validation, honeypot and rate limit"
```

---

### Task 15: /api/quote endpoint

**Files:**
- Create: `website/src/pages/api/quote.ts`
- Create: `website/tests/integration/quote.test.ts`

- [ ] **Step 1: Write the failing integration test**

Create `website/tests/integration/quote.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../../src/pages/api/quote";
import { setServicesForTest, resetServicesForTest, type AppServices } from "../../src/lib/runtime";
import { createRateLimiter } from "../../src/lib/rate-limit";

function buildServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    log: { append: vi.fn().mockResolvedValue(undefined) },
    email: vi.fn().mockResolvedValue(undefined) as unknown as AppServices["email"],
    fergus: { createLead: vi.fn().mockResolvedValue({ id: "L-99" }) },
    rateLimiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    logger: { warn: vi.fn(), error: vi.fn() },
    ...overrides,
  };
}

function makeForm(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request("http://test/api/quote", { method: "POST", body: fd });
}

const validFields = {
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "0400 123 456",
  jobType: "electrical",
  siteType: "hospitality",
  urgency: "within-a-week",
  siteAddress: "1 Main St, Sale VIC",
  description: "Need 3-phase install for new gaming room.",
  _hp: "",
};

describe("POST /api/quote", () => {
  beforeEach(() => resetServicesForTest());

  it("accepts a valid multipart submission and triggers log + email + fergus", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeForm(validFields), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("/quote?status=ok");
    expect(services.log.append).toHaveBeenCalledTimes(1);
    expect(services.email).toHaveBeenCalledTimes(1);
    expect(services.fergus.createLead).toHaveBeenCalledTimes(1);
  });

  it("returns 400 on missing fields", async () => {
    setServicesForTest(buildServices());
    const res = await POST({ request: makeForm({ name: "x" }), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(400);
  });

  it("silently accepts honeypot-filled submissions", async () => {
    const services = buildServices();
    setServicesForTest(services);
    const res = await POST({ request: makeForm({ ...validFields, _hp: "spam" }), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(303);
    expect(services.email).not.toHaveBeenCalled();
    expect(services.fergus.createLead).not.toHaveBeenCalled();
  });

  it("still redirects to ok even when email and fergus both throw (log is canonical)", async () => {
    const services = buildServices({
      email: vi.fn().mockRejectedValue(new Error("smtp")) as unknown as AppServices["email"],
      fergus: { createLead: vi.fn().mockRejectedValue(new Error("fergus")) },
    });
    setServicesForTest(services);
    const res = await POST({ request: makeForm(validFields), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(303);
    expect(services.log.append).toHaveBeenCalledTimes(1);
  });

  it("returns 500 if the log write itself fails (we can't lose submissions)", async () => {
    setServicesForTest(buildServices({
      log: { append: vi.fn().mockRejectedValue(new Error("disk full")) },
    }));
    const res = await POST({ request: makeForm(validFields), clientAddress: "1.2.3.4" } as any);
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the endpoint**

Create `website/src/pages/api/quote.ts`:

```ts
import type { APIRoute } from "astro";
import { quoteSchema } from "../../lib/schemas";
import { getServices } from "../../lib/runtime";
import { createQuoteHandler } from "../../lib/quote-handler";

export const prerender = false;

function clientIp(req: Request, fallback?: string): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || fallback
    || "unknown";
}

async function formToObject(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData();
    const obj: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === "string") obj[k] = v;
    }
    return obj;
  }
  return (await req.json()) as Record<string, unknown>;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const services = getServices();
  const ip = clientIp(request, clientAddress);

  let raw: Record<string, unknown>;
  try {
    raw = await formToObject(request);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (parsed.data._hp) {
    return Response.redirect(new URL("/quote?status=ok", request.url), 303);
  }

  if (!services.rateLimiter.check(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  const handler = createQuoteHandler({
    log: services.log,
    email: services.email,
    fergus: services.fergus,
    logger: services.logger,
  });

  const result = await handler.handle(parsed.data);
  if (!result.ok) {
    return new Response("Server error", { status: 500 });
  }
  return Response.redirect(new URL("/quote?status=ok", request.url), 303);
};
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test
```

Expected: PASS — all 5 quote integration tests green.

- [ ] **Step 5: Commit**

```
git add website/src/pages/api/quote.ts website/tests/integration/quote.test.ts
git commit -m "add /api/quote endpoint accepting multipart form submissions"
```

---

## Phase 4 — Pages

### Task 16: Home page

**Files:**
- Create: `website/src/components/ui/SectionHeading.astro`
- Create: `website/src/components/home/Hero.astro`
- Create: `website/src/components/home/ServicesSnapshot.astro`
- Create: `website/src/components/home/FeaturedProjects.astro`
- Create: `website/src/components/home/TestimonialStrip.astro`
- Create: `website/src/components/home/QuoteCTA.astro`
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Create SectionHeading**

Create `website/src/components/ui/SectionHeading.astro`:

```astro
---
interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  class?: string;
}
const { eyebrow, title, description, class: className = "" } = Astro.props;
---
<div class={`max-w-3xl ${className}`}>
  {eyebrow && <p class="text-spark-500 tracking-[0.3em] text-xs font-semibold">{eyebrow}</p>}
  <h2 class="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h2>
  {description && <p class="mt-4 text-bone-200 text-lg">{description}</p>}
</div>
```

- [ ] **Step 2: Create Hero**

Create `website/src/components/home/Hero.astro`:

```astro
---
import Container from "../ui/Container.astro";
import Button from "../ui/Button.astro";
---
<section class="relative border-b border-ink-800">
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-spark-500)_0%,_transparent_45%)] opacity-10"></div>
  <Container class="relative py-24 md:py-32">
    <p class="text-spark-500 tracking-[0.3em] text-xs font-semibold">SALE, VIC // ACN 684 711 224</p>
    <h1 class="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
      Power<br />
      for the <span class="text-spark-500">pros.</span>
    </h1>
    <p class="mt-6 text-bone-200 max-w-xl text-lg">
      Commercial-grade electrical, audio visual, automation and communications work across Gippsland — from venues and pubs to family homes.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <Button href="/quote">Get a quote</Button>
      <Button href="/projects" variant="ghost">See our work</Button>
    </div>
  </Container>
</section>
```

- [ ] **Step 3: Create ServicesSnapshot**

Create `website/src/components/home/ServicesSnapshot.astro`:

```astro
---
import { getCollection } from "astro:content";
import Container from "../ui/Container.astro";
import SectionHeading from "../ui/SectionHeading.astro";

const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
---
<section class="py-20 md:py-28 border-b border-ink-800">
  <Container>
    <SectionHeading eyebrow="WHAT WE DO" title="Five disciplines, one team." description="From new builds to maintenance — we take it all on under one roof." />
    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-ink-700 border border-ink-700">
      {services.map((s) => (
        <a href={`/services/${s.data.slug}`} class="bg-ink-950 hover:bg-ink-900 p-6 transition-colors group flex flex-col">
          <span class="text-spark-500 text-xs font-bold tracking-[0.2em]">0{s.data.order}</span>
          <h3 class="mt-3 text-xl font-bold">{s.data.title}</h3>
          <p class="mt-3 text-bone-400 text-sm flex-1">{s.data.summary}</p>
          <span class="mt-4 text-spark-500 text-sm font-semibold group-hover:translate-x-1 transition-transform">Read more →</span>
        </a>
      ))}
    </div>
  </Container>
</section>
```

- [ ] **Step 4: Create FeaturedProjects**

Create `website/src/components/home/FeaturedProjects.astro`:

```astro
---
import { getCollection } from "astro:content";
import Container from "../ui/Container.astro";
import SectionHeading from "../ui/SectionHeading.astro";

const featured = (await getCollection("projects"))
  .filter((p) => p.data.featured)
  .sort((a, b) => b.data.year - a.data.year)
  .slice(0, 3);
---
<section class="py-20 md:py-28 border-b border-ink-800">
  <Container>
    <div class="flex items-end justify-between gap-6 flex-wrap">
      <SectionHeading eyebrow="SELECTED WORK" title="Venues we've wired." />
      <a href="/projects" class="text-spark-500 text-sm font-semibold hover:text-spark-600">All projects →</a>
    </div>
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      {featured.map((p) => (
        <a href={`/projects/${p.data.slug}`} class="group block bg-ink-900 border border-ink-800 hover:border-spark-500 transition-colors">
          <div class="aspect-[4/3] bg-ink-800 overflow-hidden">
            <img src={p.data.heroImage} alt={p.data.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          </div>
          <div class="p-5">
            <p class="text-spark-500 text-xs font-bold tracking-[0.2em] uppercase">{p.data.category}</p>
            <h3 class="mt-2 text-lg font-bold">{p.data.title}</h3>
            <p class="mt-1 text-bone-400 text-sm">{p.data.client} · {p.data.year}</p>
          </div>
        </a>
      ))}
    </div>
  </Container>
</section>
```

- [ ] **Step 5: Create TestimonialStrip**

Create `website/src/components/home/TestimonialStrip.astro`:

```astro
---
import { getCollection } from "astro:content";
import Container from "../ui/Container.astro";

const all = (await getCollection("testimonials")).sort((a, b) => a.data.order - b.data.order);
const first = all[0];
---
{first && (
  <section class="py-20 md:py-28 border-b border-ink-800">
    <Container size="narrow" class="text-center">
      <p class="text-spark-500 text-xs font-bold tracking-[0.3em] uppercase">Said about us</p>
      <blockquote class="mt-6 text-2xl md:text-3xl font-medium leading-snug">
        “{first.data.quote}”
      </blockquote>
      <p class="mt-6 text-bone-400 text-sm">
        — {first.data.attribution}, {first.data.client}
      </p>
    </Container>
  </section>
)}
```

- [ ] **Step 6: Create QuoteCTA**

Create `website/src/components/home/QuoteCTA.astro`:

```astro
---
import Container from "../ui/Container.astro";
import Button from "../ui/Button.astro";
---
<section class="py-24 bg-spark-500 text-ink-950">
  <Container class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
    <div>
      <p class="text-ink-950/70 tracking-[0.3em] text-xs font-bold">START HERE</p>
      <h2 class="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Got a job in mind?</h2>
      <p class="mt-3 text-ink-950/80 max-w-xl">Tell us the basics and we'll come back with a quote — or pick up the phone if it's urgent.</p>
    </div>
    <div class="flex flex-col gap-2">
      <a href="/quote" class="inline-flex items-center justify-center px-6 py-4 bg-ink-950 text-spark-500 font-bold tracking-wide uppercase text-sm hover:bg-ink-900 transition-colors">Request a quote →</a>
      <a href="tel:0341305009" class="text-center text-ink-950 font-semibold underline">or call 03 4130 5009</a>
    </div>
  </Container>
</section>
```

- [ ] **Step 7: Replace the home page**

Replace `website/src/pages/index.astro` entirely:

```astro
---
import Base from "../layouts/Base.astro";
import Hero from "../components/home/Hero.astro";
import ServicesSnapshot from "../components/home/ServicesSnapshot.astro";
import FeaturedProjects from "../components/home/FeaturedProjects.astro";
import TestimonialStrip from "../components/home/TestimonialStrip.astro";
import QuoteCTA from "../components/home/QuoteCTA.astro";
export const prerender = true;
---
<Base title="Goodall Electrical — Commercial & Residential Electricians, Gippsland">
  <Hero />
  <ServicesSnapshot />
  <FeaturedProjects />
  <TestimonialStrip />
  <QuoteCTA />
</Base>
```

- [ ] **Step 8: Verify in dev server**

```
cd website
npm run dev
```

Browse `http://localhost:4321`. Expected: hero, five service tiles, three featured projects, testimonial quote, yellow CTA section. All links navigate to placeholder/404 pages until later tasks build them. Stop with Ctrl+C.

- [ ] **Step 9: Commit**

```
git add website/src/components/ website/src/pages/index.astro
git commit -m "build home page with hero, services, featured projects, testimonial and CTA"
```

---

### Task 17: Services index + detail pages

**Files:**
- Create: `website/src/pages/services/index.astro`
- Create: `website/src/pages/services/[slug].astro`

- [ ] **Step 1: Create the services index**

Create `website/src/pages/services/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import Base from "../../layouts/Base.astro";
import Container from "../../components/ui/Container.astro";
import SectionHeading from "../../components/ui/SectionHeading.astro";

export const prerender = true;

const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
---
<Base title="Services — Goodall Electrical" description="Commercial and residential electrical, audio visual, automation, communications and antenna services.">
  <Container class="py-20">
    <SectionHeading eyebrow="OUR SERVICES" title="What we do — and how we do it." description="Five disciplines, fully in-house. No subcontracting the work we're known for." />
    <div class="mt-16 grid md:grid-cols-2 gap-px bg-ink-700 border border-ink-700">
      {services.map((s) => (
        <a href={`/services/${s.data.slug}`} class="bg-ink-950 hover:bg-ink-900 p-8 transition-colors group">
          <p class="text-spark-500 text-xs font-bold tracking-[0.2em]">0{s.data.order}</p>
          <h2 class="mt-3 text-2xl font-bold">{s.data.title}</h2>
          <p class="mt-3 text-bone-200">{s.data.summary}</p>
          <span class="mt-5 inline-block text-spark-500 font-semibold group-hover:translate-x-1 transition-transform">Read more →</span>
        </a>
      ))}
    </div>
  </Container>
</Base>
```

- [ ] **Step 2: Create the dynamic service page**

Create `website/src/pages/services/[slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import Container from "../../components/ui/Container.astro";
import Button from "../../components/ui/Button.astro";

export const prerender = true;

export async function getStaticPaths() {
  const services = await getCollection("services");
  return services.map((service) => ({
    params: { slug: service.data.slug },
    props: { service },
  }));
}

const { service } = Astro.props;
const { Content } = await render(service);
---
<Base title={`${service.data.title} — Goodall Electrical`} description={service.data.summary}>
  <section class="border-b border-ink-800">
    <Container class="py-20">
      <a href="/services" class="text-spark-500 text-sm font-semibold">← All services</a>
      <p class="mt-6 text-spark-500 tracking-[0.3em] text-xs font-bold">0{service.data.order}</p>
      <h1 class="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">{service.data.title}</h1>
      <p class="mt-6 text-bone-200 max-w-2xl text-lg">{service.data.summary}</p>
    </Container>
  </section>
  <Container class="py-20 prose-invert max-w-3xl">
    <div class="prose prose-invert text-bone-50">
      <Content />
    </div>
    <div class="mt-12 flex gap-3 not-prose">
      <Button href="/quote">Get a quote</Button>
      <Button href="/projects" variant="ghost">See our work</Button>
    </div>
  </Container>
</Base>

<style is:global>
  .prose-invert h2 { color: var(--color-bone-50); margin-top: 2rem; font-size: 1.5rem; font-weight: 700; }
  .prose-invert h3 { color: var(--color-bone-50); margin-top: 1.5rem; font-size: 1.125rem; font-weight: 700; }
  .prose-invert p, .prose-invert li { color: var(--color-bone-200); line-height: 1.7; }
  .prose-invert ul { list-style: disc; padding-left: 1.5rem; margin-top: 1rem; }
  .prose-invert strong { color: var(--color-bone-50); }
</style>
```

- [ ] **Step 3: Verify in dev server**

```
npm run dev
```

Visit `http://localhost:4321/services` — expect 5 cards. Click each — each detail page renders with title, summary, body content (the bulleted list from the Markdown), and CTAs. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```
git add website/src/pages/services/
git commit -m "add services index and per-service detail pages from content collection"
```

---

### Task 18: Projects index + detail pages

**Files:**
- Create: `website/src/components/project/CategoryFilter.astro`
- Create: `website/src/pages/projects/index.astro`
- Create: `website/src/pages/projects/[slug].astro`

- [ ] **Step 1: Create CategoryFilter (client-side filtering with vanilla JS)**

Create `website/src/components/project/CategoryFilter.astro`:

```astro
---
interface Props { categories: string[]; }
const { categories } = Astro.props;
---
<div class="flex flex-wrap gap-2" data-filter-controls>
  <button type="button" data-filter="all" class="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-spark-500 bg-spark-500 text-ink-950">All</button>
  {categories.map((c) => (
    <button type="button" data-filter={c} class="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-ink-700 text-bone-200 hover:border-spark-500 hover:text-spark-500">
      {c}
    </button>
  ))}
</div>

<script>
  const controls = document.querySelector("[data-filter-controls]");
  const grid = document.querySelector("[data-project-grid]");
  if (controls && grid) {
    const buttons = controls.querySelectorAll<HTMLButtonElement>("button[data-filter]");
    const cards = grid.querySelectorAll<HTMLElement>("[data-category]");
    const setActive = (active: string) => {
      buttons.forEach((b) => {
        const on = b.dataset.filter === active;
        b.classList.toggle("bg-spark-500", on);
        b.classList.toggle("text-ink-950", on);
        b.classList.toggle("border-spark-500", on);
        b.classList.toggle("border-ink-700", !on);
        b.classList.toggle("text-bone-200", !on);
      });
      cards.forEach((card) => {
        card.hidden = active !== "all" && card.dataset.category !== active;
      });
    };
    buttons.forEach((b) => b.addEventListener("click", () => setActive(b.dataset.filter || "all")));
  }
</script>
```

- [ ] **Step 2: Create the projects index**

Create `website/src/pages/projects/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import Base from "../../layouts/Base.astro";
import Container from "../../components/ui/Container.astro";
import SectionHeading from "../../components/ui/SectionHeading.astro";
import CategoryFilter from "../../components/project/CategoryFilter.astro";

export const prerender = true;

const projects = (await getCollection("projects")).sort((a, b) => b.data.year - a.data.year);
const categories = Array.from(new Set(projects.map((p) => p.data.category)));
---
<Base title="Projects — Goodall Electrical" description="Selected venue, commercial and residential work from across Gippsland.">
  <Container class="py-20">
    <SectionHeading eyebrow="OUR WORK" title="Selected projects." description="Filter by category — every project is a real job we've handled end-to-end." />
    <div class="mt-10">
      <CategoryFilter categories={categories} />
    </div>
    <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-project-grid>
      {projects.map((p) => (
        <a href={`/projects/${p.data.slug}`} data-category={p.data.category} class="group block bg-ink-900 border border-ink-800 hover:border-spark-500 transition-colors">
          <div class="aspect-[4/3] bg-ink-800 overflow-hidden">
            <img src={p.data.heroImage} alt={p.data.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          </div>
          <div class="p-5">
            <p class="text-spark-500 text-xs font-bold tracking-[0.2em] uppercase">{p.data.category}</p>
            <h3 class="mt-2 text-lg font-bold">{p.data.title}</h3>
            <p class="mt-1 text-bone-400 text-sm">{p.data.client} · {p.data.year}</p>
          </div>
        </a>
      ))}
    </div>
  </Container>
</Base>
```

- [ ] **Step 3: Create the dynamic project page**

Create `website/src/pages/projects/[slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import Container from "../../components/ui/Container.astro";
import Button from "../../components/ui/Button.astro";

export const prerender = true;

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    params: { slug: project.data.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---
<Base title={`${project.data.title} — Goodall Electrical`} description={`${project.data.client} project: ${project.data.title}`}>
  <section class="border-b border-ink-800">
    <Container class="py-16">
      <a href="/projects" class="text-spark-500 text-sm font-semibold">← All projects</a>
      <p class="mt-6 text-spark-500 tracking-[0.3em] text-xs font-bold uppercase">{project.data.category}</p>
      <h1 class="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight">{project.data.title}</h1>
      <p class="mt-4 text-bone-400">{project.data.client} · {project.data.year} · {project.data.services.join(" + ")}</p>
    </Container>
  </section>

  <Container class="py-16">
    <div class="aspect-[16/9] bg-ink-800 overflow-hidden mb-12">
      <img src={project.data.heroImage} alt={project.data.title} class="w-full h-full object-cover" />
    </div>
    <div class="grid md:grid-cols-3 gap-12">
      <div class="md:col-span-2 prose-invert">
        <Content />
      </div>
      <aside class="text-sm">
        <p class="text-bone-400 uppercase tracking-[0.2em] font-bold text-xs">Client</p>
        <p class="mt-1 text-bone-50">{project.data.client}</p>
        <p class="mt-6 text-bone-400 uppercase tracking-[0.2em] font-bold text-xs">Services</p>
        <ul class="mt-1 text-bone-50">
          {project.data.services.map((s) => <li>{s}</li>)}
        </ul>
        <p class="mt-6 text-bone-400 uppercase tracking-[0.2em] font-bold text-xs">Year</p>
        <p class="mt-1 text-bone-50">{project.data.year}</p>
      </aside>
    </div>

    {project.data.gallery.length > 0 && (
      <div class="mt-16 grid grid-cols-2 md:grid-cols-3 gap-3">
        {project.data.gallery.map((g) => (
          <div class="aspect-square bg-ink-800 overflow-hidden">
            <img src={g} alt="" class="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    )}

    <div class="mt-16 flex gap-3">
      <Button href="/quote">Get a quote for similar work</Button>
      <Button href="/projects" variant="ghost">More projects</Button>
    </div>
  </Container>
</Base>
```

- [ ] **Step 4: Verify in dev server**

```
npm run dev
```

Visit `/projects`. Expect filter buttons + three project cards. Click each filter — cards filter correctly. Click a card — detail page renders with hero, sidebar metadata, body Markdown. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```
git add website/src/components/project/ website/src/pages/projects/
git commit -m "add projects index with category filter and per-project detail pages"
```

---

### Task 19: About, Testimonials and Contact pages

**Files:**
- Create: `website/src/pages/about.astro`
- Create: `website/src/pages/testimonials.astro`
- Create: `website/src/pages/contact.astro`
- Create: `website/src/components/forms/FormField.astro`
- Create: `website/src/components/forms/ContactForm.astro`

- [ ] **Step 1: Create the FormField primitive**

Create `website/src/components/forms/FormField.astro`:

```astro
---
interface Props {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  rows?: number;
  autocomplete?: string;
}
const { name, label, type = "text", required = false, rows = 4, autocomplete } = Astro.props;
const id = `field-${name}`;
---
<label for={id} class="block">
  <span class="text-xs font-bold tracking-[0.2em] uppercase text-bone-200">{label}{required && <span class="text-spark-500">*</span>}</span>
  {type === "textarea" ? (
    <textarea id={id} name={name} rows={rows} required={required}
      class="mt-2 w-full bg-ink-900 border border-ink-700 px-4 py-3 text-bone-50 placeholder-bone-400 focus:border-spark-500 focus:outline-none"></textarea>
  ) : (
    <input id={id} name={name} type={type} required={required} autocomplete={autocomplete}
      class="mt-2 w-full bg-ink-900 border border-ink-700 px-4 py-3 text-bone-50 placeholder-bone-400 focus:border-spark-500 focus:outline-none" />
  )}
</label>
```

- [ ] **Step 2: Create the ContactForm**

Create `website/src/components/forms/ContactForm.astro`:

```astro
---
import FormField from "./FormField.astro";
import Button from "../ui/Button.astro";
---
<form method="POST" action="/api/contact" enctype="application/x-www-form-urlencoded" class="space-y-6 max-w-xl">
  <FormField name="name" label="Your name" required autocomplete="name" />
  <FormField name="email" label="Email" type="email" required autocomplete="email" />
  <FormField name="phone" label="Phone" type="tel" required autocomplete="tel" />
  <FormField name="message" label="What do you need?" type="textarea" required rows={5} />
  <input type="text" name="_hp" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
  <Button type="submit">Send message</Button>
</form>
```

- [ ] **Step 3: Create the Contact page**

Create `website/src/pages/contact.astro`:

```astro
---
import Base from "../layouts/Base.astro";
import Container from "../components/ui/Container.astro";
import ContactForm from "../components/forms/ContactForm.astro";
export const prerender = true;

const status = Astro.url.searchParams.get("status");
---
<Base title="Contact — Goodall Electrical" description="Get in touch with Goodall Electrical — phone, email or contact form.">
  <Container class="py-20">
    <p class="text-spark-500 tracking-[0.3em] text-xs font-bold">GET IN TOUCH</p>
    <h1 class="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">Talk to us.</h1>

    {status === "ok" && (
      <div class="mt-8 max-w-xl border-l-4 border-spark-500 bg-ink-900 p-4">
        <p class="font-bold text-spark-500">Thanks — message received.</p>
        <p class="text-bone-200 text-sm mt-1">We'll get back to you shortly.</p>
      </div>
    )}

    <div class="mt-12 grid md:grid-cols-2 gap-16">
      <div>
        <h2 class="text-xs tracking-[0.2em] font-bold uppercase text-bone-400">By phone</h2>
        <a href="tel:0341305009" class="mt-2 block text-3xl font-bold hover:text-spark-500">03 4130 5009</a>

        <h2 class="mt-10 text-xs tracking-[0.2em] font-bold uppercase text-bone-400">Office</h2>
        <p class="mt-2 text-bone-50">Unit 5/9 Wellington Park Way<br />Sale VIC</p>

        <h2 class="mt-10 text-xs tracking-[0.2em] font-bold uppercase text-bone-400">Business details</h2>
        <p class="mt-2 text-bone-400 text-sm">ACN 684 711 224</p>
      </div>
      <div>
        <h2 class="text-xs tracking-[0.2em] font-bold uppercase text-bone-400">Send a message</h2>
        <div class="mt-4">
          <ContactForm />
        </div>
      </div>
    </div>
  </Container>
</Base>
```

- [ ] **Step 4: Create the About page**

Create `website/src/pages/about.astro`:

```astro
---
import Base from "../layouts/Base.astro";
import Container from "../components/ui/Container.astro";
import Button from "../components/ui/Button.astro";
export const prerender = true;
---
<Base title="About — Goodall Electrical">
  <Container class="py-20">
    <p class="text-spark-500 tracking-[0.3em] text-xs font-bold">ABOUT</p>
    <h1 class="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">Tradesmen, first.</h1>
    <p class="mt-6 text-bone-200 text-xl max-w-3xl">
      Goodall Electrical is a Sale-based contracting business serving Gippsland's clubs, pubs, commercial sites and family homes. We do the work other contractors subcontract out — electrical, AV, automation, comms and antennas — under one roof.
    </p>
    <div class="mt-16 grid md:grid-cols-3 gap-10">
      <div>
        <p class="text-spark-500 font-extrabold text-4xl">5</p>
        <p class="mt-2 text-bone-200">In-house disciplines, from switchboards to sports-bar AV.</p>
      </div>
      <div>
        <p class="text-spark-500 font-extrabold text-4xl">Gippsland</p>
        <p class="mt-2 text-bone-200">Our service area covers Sale, Wonthaggi, Maffra and surrounds.</p>
      </div>
      <div>
        <p class="text-spark-500 font-extrabold text-4xl">Licensed</p>
        <p class="mt-2 text-bone-200">Fully licensed and insured. ACN 684 711 224.</p>
      </div>
    </div>

    <div class="mt-16">
      <h2 class="text-3xl font-extrabold">What working with us looks like.</h2>
      <ol class="mt-8 space-y-6 max-w-2xl">
        <li class="border-l-2 border-spark-500 pl-6">
          <p class="text-spark-500 font-bold text-sm tracking-[0.2em]">01 — SITE VISIT</p>
          <p class="mt-1 text-bone-200">We come out, look at the job, and listen. No charge for a quote on most jobs.</p>
        </li>
        <li class="border-l-2 border-spark-500 pl-6">
          <p class="text-spark-500 font-bold text-sm tracking-[0.2em]">02 — SCOPE & QUOTE</p>
          <p class="mt-1 text-bone-200">We come back with a clear written quote — labour, materials, timeline, all itemised.</p>
        </li>
        <li class="border-l-2 border-spark-500 pl-6">
          <p class="text-spark-500 font-bold text-sm tracking-[0.2em]">03 — DO THE JOB</p>
          <p class="mt-1 text-bone-200">Our team does the work. We coordinate with any other trades on site and clean up after ourselves.</p>
        </li>
        <li class="border-l-2 border-spark-500 pl-6">
          <p class="text-spark-500 font-bold text-sm tracking-[0.2em]">04 — HAND OVER</p>
          <p class="mt-1 text-bone-200">Compliance paperwork, certificates, and a walk-through so your team knows what was done and how it works.</p>
        </li>
      </ol>
    </div>

    <div class="mt-16 flex gap-3">
      <Button href="/quote">Get a quote</Button>
      <Button href="/projects" variant="ghost">See our work</Button>
    </div>
  </Container>
</Base>
```

- [ ] **Step 5: Create the Testimonials page**

Create `website/src/pages/testimonials.astro`:

```astro
---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import Container from "../components/ui/Container.astro";
export const prerender = true;

const all = (await getCollection("testimonials")).sort((a, b) => a.data.order - b.data.order);
---
<Base title="Testimonials — Goodall Electrical" description="What our clients say about our work.">
  <Container class="py-20">
    <p class="text-spark-500 tracking-[0.3em] text-xs font-bold">TESTIMONIALS</p>
    <h1 class="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">In their words.</h1>
    <div class="mt-16 grid md:grid-cols-2 gap-12">
      {all.map((t) => (
        <figure class="border-l-4 border-spark-500 pl-6">
          <blockquote class="text-xl font-medium leading-snug">“{t.data.quote}”</blockquote>
          <figcaption class="mt-4 text-bone-400 text-sm">— {t.data.attribution}, {t.data.client}</figcaption>
        </figure>
      ))}
    </div>
  </Container>
</Base>
```

- [ ] **Step 6: Verify in dev server**

```
npm run dev
```

Visit `/about`, `/testimonials`, `/contact`. Each renders cleanly. Submit the contact form — it should redirect, but the API requires env vars, so expect a runtime error in the terminal. We'll handle that in Phase 6. For now confirm the form posts. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```
git add website/src/pages/about.astro website/src/pages/testimonials.astro website/src/pages/contact.astro website/src/components/forms/
git commit -m "add about, testimonials and contact pages with contact form"
```

---

### Task 20: Quote page with structured form

**Files:**
- Create: `website/src/components/forms/QuoteForm.astro`
- Create: `website/src/pages/quote.astro`

- [ ] **Step 1: Create the QuoteForm**

Create `website/src/components/forms/QuoteForm.astro`:

```astro
---
import FormField from "./FormField.astro";
import Button from "../ui/Button.astro";
---
<form method="POST" action="/api/quote" enctype="multipart/form-data" class="space-y-6">
  <div class="grid md:grid-cols-2 gap-6">
    <FormField name="name" label="Your name" required autocomplete="name" />
    <FormField name="email" label="Email" type="email" required autocomplete="email" />
    <FormField name="phone" label="Phone" type="tel" required autocomplete="tel" />
    <FormField name="siteAddress" label="Site address" required autocomplete="street-address" />
  </div>

  <fieldset>
    <legend class="text-xs font-bold tracking-[0.2em] uppercase text-bone-200">Job type<span class="text-spark-500">*</span></legend>
    <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
      {[
        ["electrical", "Electrical"],
        ["audio-visual", "Audio Visual"],
        ["automation", "Automation"],
        ["communications", "Communications"],
        ["antenna", "Antenna"],
        ["multiple", "Multiple"],
      ].map(([v, l]) => (
        <label class="flex items-center gap-2 border border-ink-700 px-4 py-3 cursor-pointer hover:border-spark-500 has-[:checked]:border-spark-500 has-[:checked]:bg-ink-900">
          <input type="radio" name="jobType" value={v} required class="accent-spark-500" />
          <span class="text-bone-50 text-sm">{l}</span>
        </label>
      ))}
    </div>
  </fieldset>

  <fieldset>
    <legend class="text-xs font-bold tracking-[0.2em] uppercase text-bone-200">Site type<span class="text-spark-500">*</span></legend>
    <div class="mt-3 grid grid-cols-3 gap-2">
      {[
        ["hospitality", "Hospitality"],
        ["commercial", "Commercial"],
        ["residential", "Residential"],
      ].map(([v, l]) => (
        <label class="flex items-center gap-2 border border-ink-700 px-4 py-3 cursor-pointer hover:border-spark-500 has-[:checked]:border-spark-500 has-[:checked]:bg-ink-900">
          <input type="radio" name="siteType" value={v} required class="accent-spark-500" />
          <span class="text-bone-50 text-sm">{l}</span>
        </label>
      ))}
    </div>
  </fieldset>

  <fieldset>
    <legend class="text-xs font-bold tracking-[0.2em] uppercase text-bone-200">Urgency<span class="text-spark-500">*</span></legend>
    <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
      {[
        ["emergency", "Emergency"],
        ["within-a-week", "Within a week"],
        ["within-a-month", "Within a month"],
        ["planning", "Planning ahead"],
      ].map(([v, l]) => (
        <label class="flex items-center gap-2 border border-ink-700 px-4 py-3 cursor-pointer hover:border-spark-500 has-[:checked]:border-spark-500 has-[:checked]:bg-ink-900">
          <input type="radio" name="urgency" value={v} required class="accent-spark-500" />
          <span class="text-bone-50 text-sm">{l}</span>
        </label>
      ))}
    </div>
  </fieldset>

  <FormField name="description" label="Tell us about the job" type="textarea" required rows={6} />

  <input type="text" name="_hp" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />

  <Button type="submit">Send my quote request</Button>
  <p class="text-bone-400 text-sm">We'll come back to you within one business day.</p>
</form>
```

- [ ] **Step 2: Create the Quote page**

Create `website/src/pages/quote.astro`:

```astro
---
import Base from "../layouts/Base.astro";
import Container from "../components/ui/Container.astro";
import QuoteForm from "../components/forms/QuoteForm.astro";
export const prerender = true;

const status = Astro.url.searchParams.get("status");
---
<Base title="Request a quote — Goodall Electrical" description="Tell us about your job and we'll come back to you with a quote.">
  <Container class="py-20" size="narrow">
    <p class="text-spark-500 tracking-[0.3em] text-xs font-bold">REQUEST A QUOTE</p>
    <h1 class="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">Tell us the job.</h1>
    <p class="mt-4 text-bone-200 text-lg">Fill out the basics — we'll handle the rest. Urgent? Call <a href="tel:0341305009" class="text-spark-500 font-semibold">03 4130 5009</a>.</p>

    {status === "ok" ? (
      <div class="mt-12 border-l-4 border-spark-500 bg-ink-900 p-6">
        <p class="font-bold text-spark-500 text-lg">Thanks — we've got your request.</p>
        <p class="text-bone-200 mt-2">A team member will be in touch within one business day. For anything urgent, call us on <a href="tel:0341305009" class="text-spark-500 font-semibold">03 4130 5009</a>.</p>
      </div>
    ) : (
      <div class="mt-12">
        <QuoteForm />
      </div>
    )}
  </Container>
</Base>
```

- [ ] **Step 3: Verify in dev server**

```
npm run dev
```

Visit `/quote`. Expect a structured form with radio groups for job type, site type, urgency, plus name/email/phone/address/description. Tab through fields — focus rings are yellow. Visit `/quote?status=ok` directly — confirmation card renders instead. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```
git add website/src/components/forms/QuoteForm.astro website/src/pages/quote.astro
git commit -m "add quote page with structured form and thank-you state"
```

---

## Phase 5 — SEO and polish

### Task 21: JSON-LD, robots, OG image placeholder

**Files:**
- Create: `website/src/components/seo/LocalBusinessJsonLd.astro`
- Modify: `website/src/pages/index.astro`
- Create: `website/public/robots.txt`
- Create: `website/public/og-default.jpg` (placeholder)

- [ ] **Step 1: Create the JSON-LD component**

Create `website/src/components/seo/LocalBusinessJsonLd.astro`:

```astro
---
const data = {
  "@context": "https://schema.org",
  "@type": "Electrician",
  "name": "Goodall Electrical",
  "telephone": "+61341305009",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Unit 5/9 Wellington Park Way",
    "addressLocality": "Sale",
    "addressRegion": "VIC",
    "addressCountry": "AU",
  },
  "areaServed": "Gippsland, Victoria, Australia",
  "url": Astro.site?.toString(),
  "identifier": "ACN 684 711 224",
};
---
<script type="application/ld+json" set:html={JSON.stringify(data)}></script>
```

- [ ] **Step 2: Include it from the home page**

Edit `website/src/pages/index.astro` — add the import and include the component once, right after the closing `</Base>`'s opening (i.e. as the first child inside Base):

Replace the file with:

```astro
---
import Base from "../layouts/Base.astro";
import Hero from "../components/home/Hero.astro";
import ServicesSnapshot from "../components/home/ServicesSnapshot.astro";
import FeaturedProjects from "../components/home/FeaturedProjects.astro";
import TestimonialStrip from "../components/home/TestimonialStrip.astro";
import QuoteCTA from "../components/home/QuoteCTA.astro";
import LocalBusinessJsonLd from "../components/seo/LocalBusinessJsonLd.astro";
export const prerender = true;
---
<Base title="Goodall Electrical — Commercial & Residential Electricians, Gippsland">
  <LocalBusinessJsonLd />
  <Hero />
  <ServicesSnapshot />
  <FeaturedProjects />
  <TestimonialStrip />
  <QuoteCTA />
</Base>
```

- [ ] **Step 3: Create robots.txt**

Create `website/public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://goodallelectrical.com.au/sitemap-index.xml
```

- [ ] **Step 4: Create an OG image placeholder**

Use the same 1x1 placeholder JPG approach as in Task 5. The Base layout references `/og-default.jpg` — until a real one is supplied, the placeholder won't crash anything:

```
node -e "const fs=require('fs'); fs.writeFileSync('website/public/og-default.jpg', Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA/9k=','base64'));"
```

- [ ] **Step 5: Verify build produces a sitemap**

```
cd website
npm run build
ls dist/client | grep sitemap
```

Expected: `sitemap-index.xml` and `sitemap-0.xml` present.

- [ ] **Step 6: Commit**

```
git add website/src/components/seo/ website/src/pages/index.astro website/public/robots.txt website/public/og-default.jpg
git commit -m "add LocalBusiness JSON-LD, robots.txt and sitemap"
```

---

## Phase 6 — Container

### Task 22: Dockerfile

**Files:**
- Create: `website/Dockerfile`
- Create: `website/.dockerignore`

- [ ] **Step 1: Create .dockerignore**

Create `website/.dockerignore`:

```
node_modules
dist
.astro
.env
.env.local
.git
.DS_Store
tests
playwright-report
test-results
coverage
*.log
```

- [ ] **Step 2: Create the Dockerfile**

Create `website/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
RUN apk add --no-cache tini && \
    addgroup -S app && adduser -S app -G app && \
    mkdir -p /var/log/goodall && chown -R app:app /var/log/goodall
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
USER app
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./dist/server/entry.mjs"]
```

- [ ] **Step 3: Build the image locally and verify size**

```
cd website
docker build -t goodall-website:dev .
docker images goodall-website:dev
```

Expected: image present, size under ~250MB (target was 150MB; sharp + node_modules push it up — that's fine).

- [ ] **Step 4: Commit**

```
git add website/Dockerfile website/.dockerignore
git commit -m "add multi-stage Dockerfile producing a Node 22 alpine runtime image"
```

---

### Task 23: docker-compose and .env.example

**Files:**
- Create: `website/docker-compose.yml`
- Create: `website/.env.example`

- [ ] **Step 1: Create .env.example**

Create `website/.env.example`:

```env
# SMTP configuration for outbound mail
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
SMTP_FROM="Goodall Electrical <no-reply@example.com>"

# Where contact + quote form notifications land
GOODALL_INBOX=office@example.com

# Fergus API integration
FERGUS_API_BASE=https://api.fergus.com
FERGUS_API_KEY=your-fergus-api-key

# Form rate limit per IP per hour (default 5)
RATE_LIMIT_PER_HOUR=5

# Where the canonical JSONL log of submissions is written
SUBMISSION_LOG_PATH=/var/log/goodall/submissions.jsonl
```

- [ ] **Step 2: Create docker-compose.yml**

Create `website/docker-compose.yml`:

```yaml
services:
  website:
    build: .
    image: goodall-website:latest
    container_name: goodall-website
    restart: unless-stopped
    env_file: .env
    ports:
      - "3000:3000"
    volumes:
      - submissions:/var/log/goodall
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

volumes:
  submissions:
```

- [ ] **Step 3: Verify compose config is valid**

```
cd website
docker compose config > /dev/null
```

Expected: no errors.

- [ ] **Step 4: Commit**

```
git add website/docker-compose.yml website/.env.example
git commit -m "add docker-compose and .env.example for one-command deployment"
```

---

### Task 24: Container smoke test script

**Files:**
- Create: `website/scripts/docker-smoke.sh`

- [ ] **Step 1: Create the smoke test script**

Create `website/scripts/docker-smoke.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

IMAGE="goodall-website:smoke"
CTR="goodall-smoke"
PORT=8765

cleanup() {
  docker rm -f "$CTR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Building image..."
docker build -t "$IMAGE" .

echo "Starting container..."
docker run -d --name "$CTR" \
  -p "$PORT:3000" \
  -e SMTP_HOST=smtp.example.invalid \
  -e SMTP_PORT=587 \
  -e SMTP_USER=u -e SMTP_PASS=p \
  -e SMTP_FROM=no-reply@x.com \
  -e GOODALL_INBOX=office@x.com \
  -e FERGUS_API_BASE=https://api.fergus.example \
  -e FERGUS_API_KEY=test \
  -e SUBMISSION_LOG_PATH=/tmp/submissions.jsonl \
  "$IMAGE"

echo "Waiting for /api/health..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null; then
    echo "  health ok"
    break
  fi
  sleep 1
  if [ "$i" = "30" ]; then
    echo "  health check never passed"
    docker logs "$CTR"
    exit 1
  fi
done

echo "Checking home page renders..."
curl -sf "http://127.0.0.1:$PORT/" | grep -q "Goodall" || {
  echo "Home page did not contain 'Goodall'"
  exit 1
}

echo "Checking /quote renders..."
curl -sf "http://127.0.0.1:$PORT/quote" | grep -q "quote" || {
  echo "Quote page did not render"
  exit 1
}

echo "All smoke checks passed."
```

- [ ] **Step 2: Make it executable and run it**

```
chmod +x website/scripts/docker-smoke.sh
cd website
./scripts/docker-smoke.sh
```

Expected output ends with: `All smoke checks passed.`

If the build fails because the Astro server's dependencies aren't present at runtime, double-check that `npm ci` produced production-friendly node_modules. Astro's standalone Node output includes everything in `dist/server`, so the runtime image only needs the dependencies marked at install time.

- [ ] **Step 3: Commit**

```
git add website/scripts/docker-smoke.sh
git commit -m "add Docker smoke test script for CI/local validation"
```

---

## Phase 7 — E2E and README

### Task 25: Playwright E2E tests

**Files:**
- Create: `website/playwright.config.ts`
- Create: `website/tests/e2e/pages.spec.ts`
- Create: `website/tests/e2e/quote-form.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```
cd website
npx playwright install chromium
```

- [ ] **Step 2: Create the Playwright config**

Create `website/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

> Note: the dev server doesn't have real SMTP/Fergus credentials, so the `/api/quote` endpoint will fail at the service-construction step. The E2E test in this task asserts the page renders and form fields are accessible; the actual POST path is exercised by integration tests in Phase 3.

- [ ] **Step 3: Create the page-render E2E test**

Create `website/tests/e2e/pages.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", title: /Goodall Electrical/ },
  { path: "/services", title: /Services/ },
  { path: "/services/electrical", title: /Electrical/ },
  { path: "/services/audio-visual", title: /Audio Visual/ },
  { path: "/projects", title: /Projects/ },
  { path: "/projects/sale-greyhound-av", title: /Sale Greyhound/ },
  { path: "/about", title: /About/ },
  { path: "/testimonials", title: /Testimonials/ },
  { path: "/contact", title: /Contact/ },
  { path: "/quote", title: /quote/i },
];

for (const p of pages) {
  test(`renders ${p.path}`, async ({ page }) => {
    const res = await page.goto(p.path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(p.title);
    await expect(page.locator("header a", { hasText: "GOODALL" })).toBeVisible();
    await expect(page.locator("footer")).toContainText("ACN 684 711 224");
  });
}
```

- [ ] **Step 4: Create the quote-form E2E test**

Create `website/tests/e2e/quote-form.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("quote form has all required fields and accepts focus", async ({ page }) => {
  await page.goto("/quote");
  for (const name of ["name", "email", "phone", "siteAddress", "description"]) {
    const field = page.locator(`[name="${name}"]`);
    await expect(field).toBeVisible();
    await field.focus();
  }
  await expect(page.locator('input[name="jobType"][value="electrical"]')).toBeAttached();
  await expect(page.locator('input[name="siteType"][value="hospitality"]')).toBeAttached();
  await expect(page.locator('input[name="urgency"][value="emergency"]')).toBeAttached();
  // Honeypot must be hidden:
  await expect(page.locator('input[name="_hp"]')).toBeHidden();
});

test("quote thank-you state renders on ?status=ok", async ({ page }) => {
  await page.goto("/quote?status=ok");
  await expect(page.getByText("Thanks — we've got your request.")).toBeVisible();
});
```

- [ ] **Step 5: Run the E2E suite**

```
cd website
npm run test:e2e
```

Expected: all tests pass. If a page errors because content collection schema is wrong, fix the offending file and rerun.

- [ ] **Step 6: Commit**

```
git add website/playwright.config.ts website/tests/e2e/
git commit -m "add Playwright E2E smoke tests for all pages and the quote form"
```

---

### Task 26: README

**Files:**
- Create: `website/README.md`

- [ ] **Step 1: Write the README**

Create `website/README.md`:

```markdown
# Goodall Electrical Website

Marketing site for Goodall Electrical. Built with Astro 5 + Tailwind v4. Runs in a single Docker container.

## Local development

Requires Node 22.

```
cd website
npm install
npm run dev
```

The dev server starts at `http://localhost:4321`. Content lives in `src/content/{services,projects,testimonials}/` as Markdown files — edits hot-reload.

## Tests

```
npm test           # unit + integration (Vitest)
npm run test:e2e   # Playwright end-to-end
```

## Production build

```
npm run build      # outputs dist/
npm start          # runs the Node SSR server on $PORT (default 3000)
```

## Docker

```
docker build -t goodall-website .
docker run --rm -p 3000:3000 --env-file .env goodall-website
```

Or with compose:

```
cp .env.example .env   # then fill in real values
docker compose up -d
```

The container exposes a `/api/health` endpoint that compose uses for healthchecks.

## Environment variables

See `.env.example`. All required at runtime — the server fails fast on boot if any are missing.

| Variable | Purpose |
|---|---|
| `SMTP_HOST`/`PORT`/`USER`/`PASS`/`FROM` | Outbound mail (Nodemailer) |
| `GOODALL_INBOX` | Where contact + quote notifications go |
| `FERGUS_API_BASE`/`FERGUS_API_KEY` | Lead-creation integration |
| `RATE_LIMIT_PER_HOUR` | Per-IP form submission limit (default 5) |
| `SUBMISSION_LOG_PATH` | JSONL log of every submission (canonical record) |

## Form pipeline

`/api/quote` and `/api/contact` accept submissions, validate with Zod, rate-limit by IP, honeypot-filter, then:

1. Append a JSONL record to `SUBMISSION_LOG_PATH` (canonical; failure here returns 500).
2. Send an email via SMTP (best-effort).
3. Post a lead to Fergus (best-effort, quote form only).

Best-effort steps run in parallel via `Promise.allSettled`; either failing does not block the user's success page or lose the submission.

## Content model

| Collection | Path | Schema |
|---|---|---|
| Services | `src/content/services/*.md` | title, slug, order, heroImage, summary |
| Projects | `src/content/projects/*.md` | title, slug, client, category, services[], year, featured, heroImage, gallery[] |
| Testimonials | `src/content/testimonials/*.md` | quote, attribution, client, order |

Schemas live in `src/content.config.ts`.
```

- [ ] **Step 2: Commit**

```
git add website/README.md
git commit -m "add README covering local dev, tests, Docker and content model"
```

---

## Final pass: run the full suite and the Docker smoke

- [ ] **Step 1: Run all unit + integration tests**

```
cd website
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run E2E**

```
npm run test:e2e
```

Expected: all tests pass.

- [ ] **Step 3: Run the Docker smoke**

```
./scripts/docker-smoke.sh
```

Expected: `All smoke checks passed.`

- [ ] **Step 4: Manual browser walk-through**

```
npm run dev
```

Visit each page in a browser. Confirm:
- Home renders with hero, services, featured projects, testimonial, CTA.
- All five service pages render with body content.
- Projects index filters work (click each category button).
- All three project detail pages render with hero, sidebar, body.
- About page renders with stats and process steps.
- Testimonials page lists all quotes.
- Contact page shows phone, address, and form.
- Quote page shows the structured form.
- Quote `?status=ok` shows thank-you state.

- [ ] **Step 5: Tag a baseline release**

```
git tag -a v0.1.0 -m "Initial site build — pages, content, forms, Docker"
```

---

## Out of scope (deferred — separate plan if/when needed)

- Real CMS or admin UI for content editing
- Customer login portal
- Online shop (e-commerce)
- Blog (collections framework is already in place; add a `posts` collection + pages when ready)
- Service-area map
- Multi-language
- File uploads on the quote form (mentioned in spec but deferred to a follow-up; the form accepts the basics and we collect photos via email reply)
- Real Fergus API endpoint shape (the client assumes a `POST /leads` shape — verify against current Fergus docs and adjust `src/lib/fergus.ts` before going live)
- CI pipeline
- TLS / reverse proxy configuration (handled outside the container per spec)
