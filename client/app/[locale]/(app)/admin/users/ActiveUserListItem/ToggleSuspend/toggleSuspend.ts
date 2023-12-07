"use server";

import { prisma } from "@/lib/prisma";

export async function toggleSuspend(userId: string, isSuspended = false) {
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      deleted: !isSuspended
    }
  });
}
