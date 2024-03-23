"use server";
import { verify } from "argon2";
import { prisma, USER_STATUS } from "database";
import { cookies } from "next/headers";

import { lucia } from "@/lib/lucia";
import { normalizeString } from "@/utils/normalizeString";

const signInReturnCodes: {
  [key in Exclude<USER_STATUS, "ACTIVE">]: string;
} = {
  ACCESS_REJECTED_BY_ADMINISTRATOR:
    "Your access request has been rejected by an administrator.",
  AWAITING_ADMINISTRATOR_APPROVAL:
    "Your access request is under administrator review.",
  AWAITING_EMAIL_VALIDATION:
    "Your must validate your email before accessing the platform.",
  DISABLED_BY_ADMINISTRATOR:
    "Your access to the platform has been revoked by an administrator",
  INACTIVE: "Your account has been disabled due to inactivity",
};

export async function signIn(userName: string, password: string) {
  try {
    const trimmedUserName = normalizeString(userName);

    const user = await prisma.user.findFirst({
      where: {
        userName: trimmedUserName,
      },
    });

    if (!user) {
      return "invalid-credentials";
    }

    if (user.status !== "ACTIVE") {
      return signInReturnCodes[user.status];
    }

    if (!(await verify(user.password, password))) {
      return "invalid-credentials";
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return "authenticated";
  } catch (e) {
    console.log(e);

    return "unknown-error";
  }
}
