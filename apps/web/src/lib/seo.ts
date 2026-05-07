import indexableRoutes from "@/routes-list.js";

const DEFAULT_SITE_URL = "https://visualdynamics.ivopr.com.br";
const APP_NAME = "Visual Dynamics";
const DEFAULT_OG_IMAGE_PATH = "/social-card.png";

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL
).replace(/\/$/, "");

export const INDEXABLE_ROUTES = indexableRoutes;

type MetaTag = Record<string, string>;

interface SeoDefinition {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  type?: "article" | "website";
}

export function absoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function createSeoHead({
  description,
  image = DEFAULT_OG_IMAGE_PATH,
  index = true,
  jsonLd,
  path,
  title,
  type = "website",
}: SeoDefinition) {
  const pageTitle = title === APP_NAME ? APP_NAME : `${title} | ${APP_NAME}`;
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
  const robots = index ? "index,follow" : "noindex,nofollow";

  const meta: MetaTag[] = [
    { title: pageTitle },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { property: "og:site_name", content: APP_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  if (jsonLd) {
    meta.push({ "script:ld+json": jsonLd } as unknown as MetaTag);
  }

  return {
    meta,
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
}

export const HOME_SEO = createSeoHead({
  title: APP_NAME,
  description:
    "Visual Dynamics is a web platform for molecular dynamics trajectory analysis, simulation workflows, and interactive 3D visualization.",
  path: "/",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
    description:
      "Web platform for molecular dynamics trajectory analysis, simulation workflows, and interactive 3D visualization.",
    publisher: {
      "@type": "Organization",
      name: "LABIOQUIM / Fiocruz",
      url: "https://portal.fiocruz.br/",
    },
  },
});

export const ABOUT_SEO = createSeoHead({
  title: "About",
  description:
    "Learn about Visual Dynamics, the LABIOQUIM and Fiocruz platform for accessible molecular dynamics analysis and visualization.",
  path: "/about",
});

export const GUIDES_SEO = createSeoHead({
  title: "Guides",
  description:
    "Watch Visual Dynamics tutorials for simulation setup, preparation, execution, and results download workflows.",
  path: "/guides",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "ACPYPE Simulation",
      embedUrl: "https://www.youtube.com/embed/wwlZOixBHe8",
      url: "https://www.youtube.com/watch?v=wwlZOixBHe8",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "ACPYPE Simulation Preparation",
      embedUrl: "https://www.youtube.com/embed/t0KfsNX2LgQ",
      url: "https://www.youtube.com/watch?v=t0KfsNX2LgQ",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "APO Simulation",
      embedUrl: "https://www.youtube.com/embed/4icOoqJlWnA",
      url: "https://www.youtube.com/watch?v=4icOoqJlWnA",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Download Simulation Results",
      embedUrl: "https://www.youtube.com/embed/kfruw1E8ZEo",
      url: "https://www.youtube.com/watch?v=kfruw1E8ZEo",
    },
  ],
});

export const ANALYTICS_SEO = createSeoHead({
  title: "Analytics",
  description:
    "Explore Visual Dynamics usage analytics and reporting for the LABIOQUIM molecular dynamics platform.",
  path: "/analytics",
});

export const PRIVACY_SEO = createSeoHead({
  title: "Privacy Notice",
  description:
    "Visual Dynamics privacy notice is being prepared. Contact the maintainers for data handling questions.",
  path: "/privacy",
  index: false,
});

export const TERMS_SEO = createSeoHead({
  title: "Terms of Use",
  description:
    "Visual Dynamics terms of use are being prepared. Contact the maintainers for current access and usage guidance.",
  path: "/terms-of-service",
  index: false,
});

export const AUTH_SEO = createSeoHead({
  title: "Authentication",
  description:
    "Sign in to access Visual Dynamics simulation submission, analysis, and management features.",
  path: "/auth/login",
  index: false,
});

export const LOGIN_SEO = createSeoHead({
  title: "Login",
  description:
    "Sign in to the Visual Dynamics application to manage simulations and review results.",
  path: "/auth/login",
  index: false,
});

export const REGISTER_SEO = createSeoHead({
  title: "Register",
  description:
    "Create a Visual Dynamics account when signups are available.",
  path: "/auth/register",
  index: false,
});

export const APP_SEO = createSeoHead({
  title: "Application",
  description:
    "Private Visual Dynamics application area for simulation submission, analysis, and management.",
  path: "/app",
  index: false,
});
