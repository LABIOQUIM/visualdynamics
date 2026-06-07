import { authClient } from "@/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins";

export async function banUser(
  userId: string,
  options?: { banReason?: string },
): Promise<UserWithRole> {
  const { data, error } = await authClient.admin.banUser({
    userId,
    banReason: options?.banReason,
  });

  if (error) throw error;

  return data.user;
}
