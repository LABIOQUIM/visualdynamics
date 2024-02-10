"use server";

import { redirect, RedirectType } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function doValidate(validationId: string) {
  try {
    const validation = await prisma.userEmailValidation.findFirst({
      where: {
        id: validationId
      },
      include: {
        user: true
      }
    });

    if (!validation) {
      return "not-found";
    }

    await prisma.userEmailValidation.update({
      where: {
        id: validationId
      },
      data: {
        used: true,
        user: {
          update: {
            emailVerified: true
          }
        }
      }
    });
  } catch (e) {
    console.log(e);
    return "unknown-error";
  }

  redirect("/login?from=validate-email", RedirectType.push);
}
