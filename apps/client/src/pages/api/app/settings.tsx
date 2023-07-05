import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@app/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const appSettingsList = await prisma.appSettings.findMany();

    if (appSettingsList.length > 0) {
      return res.json(appSettingsList[0]);
    }

    return res.json({
      id: "some-fake-id",
      maintenanceMode: false
    });
  }
}
