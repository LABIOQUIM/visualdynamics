"use server";
import { cookies } from "next/headers";

import { lucia, validateRequest } from "@/lib/lucia";

export async function invalidateSession() {
  const { session } = await validateRequest();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value);
}
