import type { APIRoute } from "astro";
import { contactSchema } from "../../lib/schemas";
import { getServices } from "../../lib/runtime";

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

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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
