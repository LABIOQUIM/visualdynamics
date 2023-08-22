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

  await sendMail({
    to: String(user.email),
    subject: "Your request to join VD has been rejected.",
    html: emailTemplate({
      base_url: process.env.APP_URL,
      preheader:
        "We're sorry, but at this moment we couldn't allow your access.",
      content:
        "We couldn't verify and approve your account.\nWe're sorry about this, but at this moment we couldn't allow your access to VD.\n\nThis could have happened for various reasons, the most common being the usage of a non-institutional e-mail address.\n\nIf you think this is an error on our part, don't hesitate to contact us.",
      showButton: false,
      showPostButtonText: false,
      email: user.email
    })
  });
}
