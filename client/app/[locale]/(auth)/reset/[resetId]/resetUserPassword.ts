"use server";

import { hash } from "argon2";

import { prisma } from "@/lib/prisma";

export async function resetUserPassword(resetId: string, newPassword: string) {
  const resetInfo = await prisma.userPasswordReset.findFirst({
    where: {
      id: resetId,
      expiresAt: { gt: new Date() },
      completed: false
    }
  });

  if (!resetInfo) {
    return "user.password.reset-failed";
  }

  const hashedPassword = await hash(newPassword);

  await prisma.user.update({
    where: {
      id: resetInfo.userId
    },
    data: {
      password: hashedPassword
    }
  });

  await prisma.userPasswordReset.update({
    where: {
      id: resetInfo.id
    },
    data: {
      completed: true
    }
  });

  return "reset";
}
