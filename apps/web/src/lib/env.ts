export function getPublicApiUrl() {
  if (typeof window !== "undefined") {
    return window.__ENV__?.API_URL ?? "http://localhost:3001";
  }

  const globalWithProcess = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };

  return globalWithProcess.process?.env?.API_URL ?? "http://localhost:3001";
}
