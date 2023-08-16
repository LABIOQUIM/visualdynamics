import { hash } from "argon2";
import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, name, password, username } = req.body;

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          status: "user.existing"
        });
      }

      const hashedPassword = await hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          username
        }
      });

      return res.status(201).json({
        status: "user.created",
        email: user.email
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        status: "user.not-created"
      });
    }
  }
}
