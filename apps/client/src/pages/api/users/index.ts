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
    const { page, searchByIdentifier } = req.query;

    if (req.method === "GET") {
      if (!session || session.user.role !== "ADMIN") {
        return res.status(401).json({
          status: "unauthorized"
        });
      }

      const count = await prisma.user.count({
        where: {
          AND: [
            {
              active: true
            },
            {
              OR: [
                {
                  email: { contains: String(searchByIdentifier) }
                },
                {
                  name: { contains: String(searchByIdentifier) }
                },
                {
                  username: { contains: String(searchByIdentifier) }
                }
              ]
            }
          ]
        }
      });

      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              active: true
            },
            {
              OR: [
                {
                  email: { contains: String(searchByIdentifier) }
                },
                {
                  name: { contains: String(searchByIdentifier) }
                },
                {
                  username: { contains: String(searchByIdentifier) }
                }
              ]
            }
          ]
        },
        orderBy: {
          username: "asc"
        },
        take: 10,
        skip: 10 * (Number(page) - 1)
      });

      return res.status(200).json({ users, count });
    }
  } catch (err) {
    console.log(err);
  }
}
