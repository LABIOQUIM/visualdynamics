export const DEFAULT_SITE_URL = "https://visualdynamics.ivopr.com.br";
export const SITE_NAME = "Visual Dynamics";
export const DEFAULT_SEO_DESCRIPTION =
  "Visual Dynamics is a web platform for molecular dynamics visualization, analysis, and scientific collaboration.";
export const DEFAULT_OG_IMAGE_PATH = "/og-default.svg";
export const PUBLIC_INDEXABLE_PATHS = ["/", "/guides", "/analytics"] as const;

type SeoInput = {
  description?: string;
  imagePath?: string;
  index?: boolean;
  path: string;
  siteUrl: string;
  title?: string;
};

export function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.replace(/\/+$/, "");
}

function buildTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}

export function buildCanonicalUrl(path: string, siteUrl: string) {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;

  return normalizedPath === "/"
    ? `${siteUrl}/`
    : `${siteUrl}${normalizedPath}`;
}

export function buildSeoHead({
  description = DEFAULT_SEO_DESCRIPTION,
  imagePath = DEFAULT_OG_IMAGE_PATH,
  index = false,
  path,
  siteUrl,
  title,
}: SeoInput) {
  const canonicalUrl = buildCanonicalUrl(path, siteUrl);
  const imageUrl = buildCanonicalUrl(imagePath, siteUrl);
  const robots = index ? "index, follow" : "noindex, nofollow";
  const fullTitle = buildTitle(title);

  return {
    title: fullTitle,
    links: [{ rel: "canonical", href: canonicalUrl }],
    meta: [
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: imageUrl },
      { property: "og:image:alt", content: `${SITE_NAME} preview` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
  };
}

export function buildRobotsTxt(siteUrl: string) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /app",
    "Disallow: /auth",
    "",
    `Sitemap: ${buildCanonicalUrl("/sitemap.xml", siteUrl)}`,
    "",
  ].join("\n");
}

export function buildSitemapXml(siteUrl: string) {
  const urls = PUBLIC_INDEXABLE_PATHS.map((path) => {
    const url = buildCanonicalUrl(path, siteUrl);

    return `  <url><loc>${url}</loc></url>`;
  }).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}
