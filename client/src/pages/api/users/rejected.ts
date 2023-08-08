import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { prisma } from "@app/lib/prisma";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === "GET") {
      if (!session || session.user.role !== "ADMIN") {
        return res.status(401).json({
          status: "unauthorized"
        });
      }

      const rejectedUsers = await prisma.user.findMany({
        where: {
          active: false,
          deleted: true
        }
      });

      return res.status(200).json(rejectedUsers);
    }
  } catch (err) {
    console.log(err);
  }
}
