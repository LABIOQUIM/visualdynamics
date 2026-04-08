import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";

export type FeatureFlag = {
  id: string;
  key: string;
  type: "BOOLEAN" | "STRING" | "NUMBER";
  enabled: boolean;
  defaultVariant: string;
  variants: Record<string, unknown>;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export const fetchFeatureFlags = async () => {
  const api = await getAPIClient();
  return api.get<FeatureFlag[]>("/feature-flags").then((r) => r.data);
};

export const getFeatureFlags = () =>
  queryOptions({
    queryKey: ["feature-flags"],
    queryFn: fetchFeatureFlags,
  });
