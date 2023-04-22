import { User as PUser } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: Omit<PUser, "password">;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User extends Omit<PUser, "password"> {}
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user?: Omit<PUser, "password">;
  }
}
