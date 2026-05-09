import { createFileRoute } from "@tanstack/react-router";

import { buildRobotsTxt } from "@/lib/seo";
import { resolveSiteUrl } from "@/lib/seo.runtime";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response(buildRobotsTxt(resolveSiteUrl(request)), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },
  },
});
