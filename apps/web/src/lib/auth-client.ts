import {
  adminClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getPublicApiUrl } from "./env";
import type { User } from "better-auth";

export const authClient = createAuthClient({
  baseURL: `${getPublicApiUrl()}/auth`,
  plugins: [twoFactorClient(), usernameClient(), adminClient()],
});

declare module "better-auth/plugins" {
  interface UserWithRole extends User {
    username: string;
    displayUsername?: string;
    twoFactorEnabled: boolean;
    role?: string | undefined;
    banned: boolean | null;
    banReason?: (string | null) | undefined;
    banExpires?: (Date | null) | undefined;
    requirePasswordChange?: boolean;
  }
}
