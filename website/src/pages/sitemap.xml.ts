import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { antennaTowns } from "../data/antenna-towns";
import { electricalTowns } from "../data/electrical-towns";
import { towns } from "../data/towns";

export const prerender = false;

interface Url {
  loc: string;
  lastmod: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site
    ? site.toString().replace(/\/$/, "")
    : "https://goodallelectrical.com.au";
  const now = new Date().toISOString();

  const services = await getCollection("services");
  const projects = await getCollection("projects");
  const posts = await getCollection("posts");

  const urls: Url[] = [
    { loc: `${origin}/`,               lastmod: now, priority: 1.0, changefreq: "weekly"  },
    { loc: `${origin}/services/`,                       lastmod: now, priority: 0.9, changefreq: "monthly" },
    { loc: `${origin}/services/electrical/`,            lastmod: now, priority: 0.9, changefreq: "monthly" },
    { loc: `${origin}/services/audio-visual/`,          lastmod: now, priority: 0.9, changefreq: "monthly" },
    { loc: `${origin}/services/control-automation/`,    lastmod: now, priority: 0.9, changefreq: "monthly" },
    { loc: `${origin}/services/communications/`,        lastmod: now, priority: 0.9, changefreq: "monthly" },
    { loc: `${origin}/services/antennas/`,              lastmod: now, priority: 0.9, changefreq: "monthly" },
    { loc: `${origin}/projects/`,      lastmod: now, priority: 0.7, changefreq: "monthly" },
    { loc: `${origin}/areas/`,         lastmod: now, priority: 0.8, changefreq: "monthly" },
    { loc: `${origin}/blog/`,          lastmod: now, priority: 0.8, changefreq: "weekly"  },
    { loc: `${origin}/about/`,         lastmod: now, priority: 0.6, changefreq: "monthly" },
    { loc: `${origin}/testimonials/`,  lastmod: now, priority: 0.6, changefreq: "monthly" },
    { loc: `${origin}/contact/`,       lastmod: now, priority: 0.8, changefreq: "monthly" },
    { loc: `${origin}/sitemap/`,       lastmod: now, priority: 0.4, changefreq: "monthly" },
  ];

  // Every service currently has a custom landing page hardcoded above,
  // so the services collection iteration is a no-op at present. Keeping
  // the loop in place — if a sixth service is ever added without a
  // custom page, it'll automatically appear in the sitemap.
  const customLandings = new Set([
    "antennas",
    "electrical",
    "audio-visual",
    "control-automation",
    "communications",
  ]);
  for (const s of services) {
    if (customLandings.has(s.data.slug)) continue;
    urls.push({
      loc: `${origin}/services/${s.data.slug}/`,
      lastmod: now,
      priority: 0.9,
      changefreq: "monthly",
    });
  }

  // Project detail pages
  for (const p of projects) {
    urls.push({
      loc: `${origin}/projects/${p.data.slug}/`,
      lastmod: now,
      priority: 0.7,
      changefreq: "monthly",
    });
  }

  // Per-town hub pages
  for (const t of towns) {
    urls.push({
      loc: `${origin}/areas/${t.slug}/`,
      lastmod: now,
      priority: 0.8,
      changefreq: "monthly",
    });
  }

  // Per-town antenna pages
  for (const t of antennaTowns) {
    urls.push({
      loc: `${origin}/services/antennas/${t.slug}/`,
      lastmod: now,
      priority: 0.8,
      changefreq: "monthly",
    });
  }

  // Per-town electrical pages
  for (const t of electricalTowns) {
    urls.push({
      loc: `${origin}/services/electrical/${t.slug}/`,
      lastmod: now,
      priority: 0.8,
      changefreq: "monthly",
    });
  }

  // Blog posts — use the post's own publishedAt/updatedAt for lastmod.
  for (const p of posts) {
    const lastmod = (p.data.updatedAt ?? p.data.publishedAt).toISOString();
    urls.push({
      loc: `${origin}/blog/${p.data.slug}/`,
      lastmod,
      priority: p.data.featured ? 0.8 : 0.6,
      changefreq: "monthly",
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
