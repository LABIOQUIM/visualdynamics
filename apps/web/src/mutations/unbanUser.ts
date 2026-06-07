import { authClient } from "@/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins";

export async function unbanUser(userId: string): Promise<UserWithRole> {
  const { data, error } = await authClient.admin.unbanUser({ userId });

  if (error) throw error;

  return data;
}
