import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import sendMail from "@app/utils/send-mail";

const emailsDir = path.resolve(process.cwd(), "emails");

export default async function sendEmail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { to } = req.query;
    const emailFile = readFileSync(path.join(emailsDir, "template.html"), {
      encoding: "utf8"
    });

    Handlebars.registerHelper("breaklines", function (text) {
      text = Handlebars.Utils.escapeExpression(text);
      text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
      return new Handlebars.SafeString(text);
    });

    const emailTemplate = Handlebars.compile(emailFile);

    try {
      const result = await sendMail({
        to: String(to),
        subject: "You can now start and track your dynamics",
        html: emailTemplate({
          base_url: process.env.APP_URL,
          preheader: "We're thrilled to have you with us!",
          content:
            "Welcome to Visual Dynamics.\nWe're thrilled to tell you that your account has been validated and now you can start a dynamic and develop something incredible.",
          showButton: true,
          buttonLink: `${process.env.APP_URL}/signin`,
          buttonText: "Go to Visual Dynamics",
          showPostButtonText: true,
          postButtonText: `You can sign in to VD using this email: ${to} and the password you provided on sign up.`,
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
