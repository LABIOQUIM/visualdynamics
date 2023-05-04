import { hash } from "argon2";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { prisma } from "@app/lib/prisma";
import sendMail from "@app/utils/send-mail";

const emailsDir = path.resolve(process.cwd(), "emails");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const emailFile = readFileSync(path.join(emailsDir, "template.html"), {
      encoding: "utf8"
    });

    Handlebars.registerHelper("breaklines", function (text) {
      text = Handlebars.Utils.escapeExpression(text);
      text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
      return new Handlebars.SafeString(text);
    });

    const emailTemplate = Handlebars.compile(emailFile);

    const { identifier } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user) {
      return res.status(400).json({
        status: "user.password.reset-failed"
      });
    }

    const resetId = randomUUID();

    await prisma.userPasswordResets.create({
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
        buttonLink: `${process.env.APP_URL}/reset-password/${resetId}`,
        buttonText: "Reset your password",
        showPostButtonText: false,
        email: user.email
      })
    });

    if (!result) {
      return res.status(400).json({
        status: "user.password.reset-failed"
      });
    }

    return res.status(201).json({
      status: "user.password.reset-sent"
    });
  } else if (req.method === "PUT") {
    const { resetId, password } = req.body;

    const resetInfo = await prisma.userPasswordResets.findFirst({
      where: {
        id: resetId,
        expiresAt: { gt: new Date() },
        completed: false
      }
    });

    if (!resetInfo) {
      return res.status(400).json({
        status: "user.password.reset-failed"
      });
    }

    const hashedPassword = await hash(password);

    await prisma.user.update({
      where: {
        id: resetInfo.userId
      },
      data: {
        password: hashedPassword
      }
    });

    await prisma.userPasswordResets.update({
      where: {
        id: resetInfo.id
      },
      data: {
        completed: true
      }
    });

    return res.status(200).json({
      status: "user.password.reset"
    });
  }
}
