"use server";
import { mailerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function approveUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: String(userId)
    }
  });

  if (!user) {
    return "user-not-found";
  }

  if (user.active) {
    return "already-active";
  }

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      active: true,
      deleted: false
    }
  });

  await mailerApi.post("/send-email", {
    to: user.email,
    from: `"⚛️ Visual Dynamics" ${process.env.SMTP_USER}`,
    subject: "You can now start and track your dynamics",
    template: "main.hbs",
    context: {
      base_url: process.env.APP_URL,
      preheader: "We're thrilled to have you with us!",
      content:
        "Welcome to Visual Dynamics.<br/>We're thrilled to tell you that your account has been validated and now you can start a dynamic and develop something incredible.",
      showButton: true,
      buttonLink: `${process.env.APP_URL}/login?from=account-activated-email`,
      buttonText: "Go to Visual Dynamics",
      showPostButtonText: true,
      postButtonText: `You can sign in to VD using this email: ${user.email} and the password you provided on sign up.`,
      email: user.email
    }
  });

  return "approved";
}
