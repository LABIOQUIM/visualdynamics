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

  const userUpdated = await prisma.user.update({
    where: {
      id: String(userId)
    },
    data: {
      active: true,
      deleted: false,
      userEmailValidation: {
        connectOrCreate: {
          where: {
            userId: String(userId)
          },
          create: {}
        }
      }
    },
    include: {
      userEmailValidation: true
    }
  });

  await mailerApi.post("/send-email", {
    to: user.email,
    from: `"⚛️ Visual Dynamics" ${process.env.SMTP_USER}`,
    subject: "Just one more step before you start and track your simulations",
    template: "main.hbs",
    context: {
      base_url: process.env.APP_URL,
      preheader: "We're thrilled to have you with us!",
      content:
        "Welcome to Visual Dynamics.<br/>We're thrilled to tell you that your account has been validated.<br/>Now you just need to validate your email by clicking the button below.<br/>Once your email is validated, you will be able to start a simulation and develop something incredible.",
      showButton: true,
      buttonLink: `${process.env.APP_URL}/verify/${userUpdated.userEmailValidation[0].id}`,
      buttonText: "Validate you email",
      showPostButtonText: true,
      postButtonText: `You can sign in to VD using this email: ${user.email} and the password you provided on sign up.`,
      email: user.email
    }
  });

  return "approved";
}
