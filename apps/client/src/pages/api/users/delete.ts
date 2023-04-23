import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { prisma } from "@app/lib/prisma";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";

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

    await prisma.user.delete({
      where: {
        id: String(userId)
      }
    });

    return res.status(200).json({
      status: "user.deleted"
    });
  }
}
