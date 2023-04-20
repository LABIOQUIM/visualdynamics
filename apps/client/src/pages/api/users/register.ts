import { hash } from "argon2";
import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@app/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, username, password } = req.body;

    try {
      const hashedPassword = await hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword
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
