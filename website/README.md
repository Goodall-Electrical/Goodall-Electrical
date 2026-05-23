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
cp .env.example .env   # fill in real values
docker compose up -d
```

The container exposes `/api/health` so compose's healthcheck can probe it.

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

## Known follow-ups

- **Real images.** All hero and project images are 1×1 placeholder JPGs. Drop real photos into `public/services/` and `public/projects/<slug>/` and update the paths in the matching Markdown files.
- **Fergus API shape.** `src/lib/fergus.ts` assumes a `POST /leads` endpoint with `Authorization: Bearer …` and the field names declared in `FergusLead`. Verify against current Fergus public-API docs before going live and adjust.
- **Brand assets.** No logo SVG yet — the wordmark in `Header.astro` and `Footer.astro` is set in type. Drop in a real logo file when supplied.
- **Owner email inbox.** `.env.example` ships with placeholders; fill in the real `GOODALL_INBOX` and SMTP creds before deploy.
