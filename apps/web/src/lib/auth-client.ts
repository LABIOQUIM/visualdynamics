import {
  adminClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: `${window.__ENV__.API_URL}/auth`,
  plugins: [adminClient(), twoFactorClient(), usernameClient()],
});
