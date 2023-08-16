import { NextApiRequest, NextApiResponse } from "next";

import { api } from "../../../lib/api";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { username, molecule, timestamp, type } = req.query;

    return res.redirect(
      302,
      `${api.defaults.baseURL}/downloads/log?username=${username}&type=${type}&molecule=${molecule}&timestamp=${timestamp}`
    );
  }
}
