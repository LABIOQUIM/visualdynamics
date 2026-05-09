import { createServerFn } from "@tanstack/react-start";

import { normalizeSiteUrl } from "@/lib/seo";

function readProcessEnv(name: string) {
  return process.env[name];
}

function getForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}

export function resolveSiteUrl(request: Request) {
  const configuredSiteUrl = readProcessEnv("SITE_URL");

  if (configuredSiteUrl) {
    return normalizeSiteUrl(configuredSiteUrl);
  }

  const requestUrl = new URL(request.url);
  const forwardedProto = getForwardedValue(
    request.headers.get("x-forwarded-proto"),
  );
  const forwardedHost = getForwardedValue(
    request.headers.get("x-forwarded-host"),
  );

  if (forwardedHost) {
    requestUrl.host = forwardedHost;
  }

  if (forwardedProto) {
    requestUrl.protocol = `${forwardedProto}:`;
  }

  return normalizeSiteUrl(requestUrl.origin);
}

export const getRuntimeSiteUrl = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getRequest } = await import("@tanstack/react-start/server");

    return resolveSiteUrl(getRequest());
  },
);

export async function loadRuntimeSeoData() {
  return {
    siteUrl: await getRuntimeSiteUrl(),
  };
}
