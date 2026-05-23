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

async function bodyToObject(req: Request): Promise<Record<string, unknown>> {
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
    raw = await bodyToObject(request);
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
