import {
  adminClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getPublicApiUrl } from "./env";

export const authClient = createAuthClient({
  baseURL: `${getPublicApiUrl()}/auth`,
  plugins: [adminClient(), twoFactorClient(), usernameClient()],
});
