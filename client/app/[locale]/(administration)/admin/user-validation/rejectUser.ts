"use server";
import { mailerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function rejectUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: String(userId)
    }
  });

  if (!user) {
    return "user-not-found";
  }

  await prisma.user.update({
    where: {
      id: String(userId)
    },
    data: {
      deleted: true
    }
  });

  await mailerApi.post("/send-email", {
    to: user.email,
    from: `"⚛️ Visual Dynamics" ${process.env.SMTP_USER}`,
    subject: "You can now start and track your dynamics",
    context: {
      base_url: process.env.APP_URL,
      preheader:
        "We're sorry, but at this moment we couldn't allow your access.",
      content:
        "We couldn't verify and approve your account.\nWe're sorry about this, but at this moment we couldn't allow your access to VD.<br><br>This could have happened for various reasons, the most common being the usage of a non-institutional e-mail address.<br><br>If you think this is an error on our part, don't hesitate to contact us.",
      showButton: false,
      showPostButtonText: false,
      email: user.email
    }
  });
}
