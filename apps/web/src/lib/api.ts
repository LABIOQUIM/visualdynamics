import axios from "axios";

import { authClient } from "./auth-client";

export async function getAPIClient() {
  const session = await authClient.getSession();

  const api = axios.create({
    baseURL: "http://localhost:3001/v1",
    headers: {
      Authorization: `Bearer ${session.data?.session.token}`,
    },
    withCredentials: true,
  });

  return api;
}
