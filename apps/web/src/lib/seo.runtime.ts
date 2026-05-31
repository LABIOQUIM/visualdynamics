import { DEFAULT_SITE_URL } from "@/lib/seo";

export async function loadRuntimeSeoData() {
  return {
    siteUrl: DEFAULT_SITE_URL,
  };
}
