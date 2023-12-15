"use server";
import { randomUUID } from "crypto";

import { mailerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function createUserPasswordReset(identifier: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }]
    }
  });

  if (!user) {
    return "user.not-found";
  }

  const resetId = randomUUID();

  await prisma.userPasswordReset.create({
    data: {
      id: resetId,
      user: {
        connect: {
          id: user.id
        }
      }
    }
  });

  await mailerApi.post("/send-email", {
    to: user.email,
    from: `"⚛️ Visual Dynamics" ${process.env.SMTP_USER}`,
    subject: "Your link to reset your password.",
    template: "main.hbs",
    context: {
      base_url: process.env.APP_URL,
      preheader: "There's your way to get back in your account!",
      content:
        "Recently you requested a account password reset.<br>You're receiving this because of that, just click the button below and get back into your account.<br>If you didn't request this, please disregard this contact.",
      showButton: true,
      buttonLink: `${process.env.APP_URL}/reset/${resetId}`,
      buttonText: "Reset your password",
      showPostButtonText: false,
      email: user.email
    }
  });

  return "mailed";
}
