const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function getPublicApiUrl() {
  return API_BASE_URL;
}
