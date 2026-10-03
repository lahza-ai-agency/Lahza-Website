import { createFileRoute } from "@tanstack/react-router";

const PATHS = ["/", "/services", "/pricing", "/case-studies/assiut-real-estate", "/about", "/contact"];

// Built from the request origin (or VITE_SITE_URL), so no domain is hard-coded.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => {
        const base = ((import.meta.env["VITE_SITE_URL"] as string | undefined) || new URL(request.url).origin).replace(/\/$/, "");
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PATHS.map((p) => `  <url><loc>${base}${p}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
