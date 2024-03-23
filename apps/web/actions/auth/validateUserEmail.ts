"use server";
import { prisma } from "database";

export async function validateUserEmail(validationCode: string) {
  try {
    await prisma.userEmailValidation.update({
      where: {
        id: validationCode,
      },
      data: {
        used: true,
        user: {
          update: {
            status: "ACTIVE",
          },
        },
      },
    });

    return true;
  } catch {
    return false;
  }
}
