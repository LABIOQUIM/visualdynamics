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
    const { to, simulationType, simulationMolecule, simulationDate } =
      req.query;
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
        subject: "Your simulation has ended.",
        html: emailTemplate({
          base_url: process.env.APP_URL,
          preheader: "The simulation you left running has ended.",
          content: `Your ${simulationType} simulation has ended.\n\nThe simulation ${simulationType} - ${simulationMolecule} that you submitted at ${Intl.DateTimeFormat(
            "en-US",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short"
            }
          ).format(
            new Date(simulationDate as string)
          )} has ended.\n\nPlease access VD to download the figure graphics, raw data and more.`,
          showButton: true,
          buttonLink: process.env.APP_URL,
          buttonText: "Go to Visual Dynamics",
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
