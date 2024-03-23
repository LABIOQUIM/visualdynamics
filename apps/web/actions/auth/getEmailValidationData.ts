"use server";
import { prisma } from "database";

export interface EmailValidationData {
  id: string;
  userId: string;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    email: string;
    firstName: string;
  };
}

export async function getEmailValidationData(
  validationCode: string | null
): Promise<EmailValidationData | null> {
  if (validationCode) {
    return await prisma.userEmailValidation.findFirst({
      where: {
        id: validationCode,
      },
      include: {
        user: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });
  }

  return null;
}
