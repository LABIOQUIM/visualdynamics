import { authClient } from "@/lib/auth-client";

export async function forcePasswordReset(userId: string): Promise<string> {
  const tempPassword = generateTempPassword();

  const { error } = await authClient.admin.setUserPassword({
    userId,
    newPassword: tempPassword,
  });

  if (error) throw error;

  return tempPassword;
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
