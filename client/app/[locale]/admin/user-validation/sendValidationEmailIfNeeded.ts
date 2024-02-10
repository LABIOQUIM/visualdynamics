"use server";

import { mailerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function sendValidationEmailIfNeeded() {
  const usersNeedingValidation = await prisma.user.findMany({
    where: {
      emailVerified: false
    }
  });

  usersNeedingValidation.forEach(async (user) => {
    const userUpdated = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        userEmailValidation: {
          create: {}
        }
      },
      include: {
        userEmailValidation: {
          select: {
            id: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    await mailerApi.post("/send-email", {
      to: user.email,
      from: `"⚛️ Visual Dynamics" ${process.env.SMTP_USER}`,
      subject: "About your account",
      template: "main.hbs",
      context: {
        base_url: process.env.APP_URL,
        preheader: "We need to validate you're really you.",
        content: `Hello, ${user.name},<br/>We need you to validate your email by clicking the button below.<br/>Once your email is validated, you will be able to continue using Visual Dynamics normally.`,
        showButton: true,
        buttonLink: `${process.env.APP_URL}/verify/${userUpdated.userEmailValidation[0].id}`,
        buttonText: "Validate you email",
        email: user.email
      }
    });
  });
}
