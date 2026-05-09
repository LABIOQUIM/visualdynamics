import { createFileRoute } from "@tanstack/react-router";

import { buildSitemapXml } from "@/lib/seo";
import { resolveSiteUrl } from "@/lib/seo.runtime";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response(buildSitemapXml(resolveSiteUrl(request)), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});
