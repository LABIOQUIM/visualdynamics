"use server";

import { randomUUID } from "crypto";
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

  const result = await sendMail({
    to: String(user.email),
    subject: "Your link to reset your password.",
    html: emailTemplate({
      base_url: process.env.APP_URL,
      preheader: "There's your way to get back in your account!",
      content:
        "Recently you requested a account password reset.\nYou're receiving this because of that, just click the button below and get back into your account.\nIf you didn't request this, please disregard this contact.",
      showButton: true,
      buttonLink: `${process.env.APP_URL}/reset/${resetId}`,
      buttonText: "Reset your password",
      showPostButtonText: false,
      email: user.email
    })
  });

  if (!result) {
    return "sendmail-failed";
  }

  return "mailed";
}
