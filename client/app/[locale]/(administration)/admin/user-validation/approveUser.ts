"use server";
import { readFileSync } from "fs";
import Handlebars from "handlebars";
import path from "path";

import { prisma } from "@/lib/prisma";
import sendMail from "@/utils/sendMail";

const emailsDir = path.resolve(process.cwd(), "emails");
const emailFile = readFileSync(path.join(emailsDir, "template.html"), {
  encoding: "utf8"
});

Handlebars.registerHelper("breaklines", function (text) {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
  return new Handlebars.SafeString(text);
});

const emailTemplate = Handlebars.compile(emailFile);

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

  await sendMail({
    to: user.email,
    subject: "You can now start and track your dynamics",
    html: emailTemplate({
      base_url: process.env.APP_URL,
      preheader: "We're thrilled to have you with us!",
      content:
        "Welcome to Visual Dynamics.\nWe're thrilled to tell you that your account has been validated and now you can start a dynamic and develop something incredible.",
      showButton: true,
      buttonLink: `${process.env.APP_URL}/account/login?from=account-activated-email`,
      buttonText: "Go to Visual Dynamics",
      showPostButtonText: true,
      postButtonText: `You can sign in to VD using this email: ${user.email} and the password you provided on sign up.`,
      email: user.email
    })
  });

  return "approved";
}
