import { verify } from "argon2";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 60 * 60 * 12
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        // @ts-ignore
        user: token.user
      };
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials) {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier },
                { username: credentials.identifier }
              ]
            }
          });

          if (!user) {
            throw new Error("user.wrong-credentials");
          }

          const { password, ...passwordlessUser } = user;

          if (user.deleted) {
            throw new Error("user.deleted");
          }

          if (!password) {
            throw new Error("user.no-pass");
          }

          if (!user.emailVerified) {
            throw new Error("user.email-not-verified");
          }

          if (await verify(password, credentials.password)) {
            if (user.active) {
              return passwordlessUser;
            }
            throw new Error("user.inactive");
          }
          throw new Error("user.wrong-credentials");
        }
        throw new Error("user.no-credentials-provided");
      }
    })
  ]
};
