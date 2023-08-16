import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { prisma } from "../../../lib/prisma";
import { authOptions } from "aold/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const session = await getServerSession(req, res, authOptions);

    const { userId } = req.query;

    if (!session || session.user.role !== "ADMIN") {
      return res.status(401).json({
        status: "unauthorized"
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: String(userId)
      }
    });

    if (!user) {
      return res.status(400).json({
        status: "user-not-found"
      });
    }

    await prisma.user.update({
      where: {
        id: String(userId)
      },
      data: {
        deleted: !user.deleted
      }
    });

    return res.status(200).json({
      status: "user.block.success"
    });
  }
}
