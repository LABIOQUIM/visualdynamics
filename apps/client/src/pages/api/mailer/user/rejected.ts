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
        subject: "Your request to join VD has been rejected.",
        html: emailTemplate({
          base_url: process.env.NEXTAUTH_URL,
          preheader:
            "We're sorry, but at this moment we couldn't allow your access.",
          content:
            "We couldn't verify and approve your account.\nWe're sorry about this, but at this moment we couldn't allow your access to VD.\n\nThis could have happened for various reasons, the most common being the usage of a non-institutional e-mail address.\n\nIf you think this is an error on our part, don't hesitate to contact us.",
          showButton: false,
          showPostButtonText: false,
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
