import { getAPIClient } from "@/lib/api";

export type CreateFeatureFlagInput = {
  key: string;
  type: "BOOLEAN" | "STRING" | "NUMBER";
  enabled: boolean;
  defaultVariant: string;
  variants: Record<string, unknown>;
  description?: string;
};

export type UpdateFeatureFlagInput = {
  enabled?: boolean;
  defaultVariant?: string;
  variants?: Record<string, unknown>;
  description?: string;
};

export async function createFeatureFlag(data: CreateFeatureFlagInput) {
  const api = await getAPIClient();
  return api.post("/feature-flags", data).then((r) => r.data);
}

export async function updateFeatureFlag(
  key: string,
  data: UpdateFeatureFlagInput,
) {
  const api = await getAPIClient();
  return api.patch(`/feature-flags/${key}`, data).then((r) => r.data);
}

export async function deleteFeatureFlag(key: string) {
  const api = await getAPIClient();
  return api.delete(`/feature-flags/${key}`).then((r) => r.data);
}
