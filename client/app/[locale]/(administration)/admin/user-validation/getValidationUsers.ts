"use server";

import { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getValidationUsers(
  mode: "inactive" | "rejected" = "inactive"
): Promise<Omit<User, "password">[]> {
  return await prisma.user.findMany({
    where: {
      active: false,
      deleted: mode !== "inactive"
    },
    select: {
      active: true,
      deleted: true,
      email: true,
      username: true,
      name: true,
      role: true,
      id: true
    }
  });
}
