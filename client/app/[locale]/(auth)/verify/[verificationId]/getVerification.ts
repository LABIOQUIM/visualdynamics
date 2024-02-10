"use server";

import { prisma } from "@/lib/prisma";

export async function getVerification(verificationId: string) {
  const verification = await prisma.userEmailValidation.findFirst({
    where: {
      id: verificationId
    },
    include: {
      user: {
        select: {
          emailVerified: true
        }
      }
    }
  });

  return verification;
}
