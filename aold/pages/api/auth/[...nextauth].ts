import { verify } from "argon2";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "../../../lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
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

          if (user) {
            console.log(user);
            const { password, ...passwordlessUser } = user;
            console.log("desestruturou");

            if (user.deleted) {
              console.log("usuário bloqueado");
              throw new Error("user.deleted");
            }

            if (!password) {
              console.log("usuário sem senha");
              throw new Error("user.no-pass");
            }

            console.log("validando senha...");
            const isPasswordCorrect = await verify(
              password,
              credentials.password
            );
            console.log(await verify(password, credentials.password));
            if (isPasswordCorrect) {
              console.log("senha validada");
              if (user.active) {
                console.log("usuário ativo, logando...");
                return passwordlessUser;
              }
              console.log("usuário aguardando validação");
              throw new Error("user.inactive");
            }
            console.log("usuário errou a senha");
            throw new Error("user.wrong-credentials");
          }
          console.log("usuário não encontrado");
          return null;
        }
        console.log("usuário não forneceu credenciais");
        return null;
      }
    })
  ]
};

export default NextAuth(authOptions);
