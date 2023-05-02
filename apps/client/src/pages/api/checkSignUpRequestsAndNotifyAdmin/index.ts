import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { prisma } from "@app/lib/prisma";
import sendMail from "@app/utils/send-mail";

const emailsDir = path.resolve(process.cwd(), "emails");

export default async function sendEmail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const emailFile = readFileSync(path.join(emailsDir, "template.html"), {
      encoding: "utf8"
    });

    Handlebars.registerHelper("breaklines", function (text) {
      text = Handlebars.Utils.escapeExpression(text);
      text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
      return new Handlebars.SafeString(text);
    });

    const emailTemplate = Handlebars.compile(emailFile);

    const awaitingCount = await prisma.user.count({
      where: {
        active: false
      }
    });

    if (awaitingCount === 0) {
      return res.status(200).json({ message: "no-awaiting" });
    }

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN"
      }
    });

    const to = admins.map((admin) => admin.email);

    try {
      const result = await sendMail({
        to,
        subject: `There are ${awaitingCount} sign up requests awaiting your approval`,
        html: emailTemplate({
          base_url: process.env.APP_URL,
          preheader: "There are people awaiting to use VD",
          content:
            "Hey there, Admin.\n\nThere are some sign up requests awaiting to be reviewed by you.",
          showButton: true,
          buttonLink: `${process.env.APP_URL}/admin/signup`,
          buttonText: "Go to Visual Dynamics",
          showPostButtonText: true,
          postButtonText: `Remember: When you approve or reject someone they'll receive an automated email about this decision.`,
          email: to
        })
      });
      return res.status(200).json({ success: result });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
