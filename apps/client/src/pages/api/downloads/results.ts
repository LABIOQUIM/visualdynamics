import { NextApiRequest, NextApiResponse } from "next";

import { api } from "@app/lib/api";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { taskId } = req.query;

    return res.redirect(
      302,
      `${api.defaults.baseURL}/downloads/results?taskId=${taskId}`
    );
  }
}
