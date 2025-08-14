"use server";
import { cookies } from "next/headers";

import { validateAuth } from "@/actions/auth/validateAuth";
import { lucia } from "@/lib/lucia";

export async function invalidateAuth() {
  const { session } = await validateAuth();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).delete(sessionCookie.name);
}
