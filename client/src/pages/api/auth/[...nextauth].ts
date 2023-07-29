import { verify } from "argon2";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@app/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
        //@ts-ignore
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

          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...passwordlessUser } = user;

            if (user.deleted) {
              throw new Error("user.deleted");
            }

            if (!password) {
              throw new Error("user.no-pass");
            }

            if (await verify(password, credentials.password)) {
              if (user.active) {
                return passwordlessUser;
              }
              throw new Error("user.inactive");
            }

            throw new Error("user.wrong-credentials");
          }
        }
        return null;
      }
    })
  ]
};

export default NextAuth(authOptions);
