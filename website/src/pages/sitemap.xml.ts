import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const target = new URL("/sitemap-index.xml", url.origin).toString();
  return new Response(null, {
    status: 301,
    headers: { Location: target },
  });
};
