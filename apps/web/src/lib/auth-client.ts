import {
  adminClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const apiUrl =
  typeof window === "undefined"
    ? "http://localhost:3001"
    : window.__ENV__.API_URL;

export const authClient = createAuthClient({
  baseURL: `${apiUrl}/auth`,
  plugins: [adminClient(), twoFactorClient(), usernameClient()],
});
