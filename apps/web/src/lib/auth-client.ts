import {
  adminClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { User } from "better-auth";

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/auth`,
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
