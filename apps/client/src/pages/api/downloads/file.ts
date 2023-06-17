import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { api } from "@app/lib/api";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    const { fullPath } = req.query;

    if (!session || session.user.role !== "ADMIN") {
      return res.status(401).json({
        status: "unauthorized"
      });
    }

    return res.redirect(
      302,
      `${api.defaults.baseURL}/downloads/file?fullPath=${fullPath}`
    );
  }
}
