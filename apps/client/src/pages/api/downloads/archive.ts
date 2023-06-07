import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { api } from "@app/lib/api";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    if (session && session.user) {
      return res.redirect(
        302,
        `${api.defaults.baseURL}/downloads/archive?username=${session.user.username}`
      );
    }

    return res;
  }
}
