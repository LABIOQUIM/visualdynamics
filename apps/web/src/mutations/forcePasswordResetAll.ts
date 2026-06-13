import { getAPIClient } from "@/lib/api";

export async function forcePasswordResetAll(): Promise<{ affected: number }> {
  const client = await getAPIClient();

  const { data } = await client.post<{ affected: number }>(
    "/admin/force-password-reset-all",
    {},
  );

  return data;
}
