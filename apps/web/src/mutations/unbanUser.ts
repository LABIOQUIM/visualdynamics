import { authClient } from "@/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins";

export async function unbanUser(userId: string): Promise<UserWithRole> {
  const { data, error } = await authClient.admin.unbanUser({ userId });

  if (error) throw error;

  // @ts-expect-error Some error happening with better-auth plugin typings
  return data;
}
