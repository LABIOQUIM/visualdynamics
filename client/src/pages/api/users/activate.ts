import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { prisma } from "@app/lib/prisma";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions);

    const { userId } = req.body;

    if (!session || session.user.role !== "ADMIN") {
      return res.status(401).json({
        status: "unauthorized"
      });
    }

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        active: true
      }
    });

    return res.status(200).json({
      status: "user.activated"
    });
  }
}
