"use server";

import { Prisma } from "@prisma/client";
import { hash } from "argon2";

import { prisma } from "@/lib/prisma";

export async function createUser(data: Prisma.UserCreateInput) {
  const existingUser = !!(await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.email }]
    }
  }));

  if (existingUser) {
    return "user.existing";
  }

  const hashedPassword = await hash(data.password!);

  const newUser = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword
    }
  });

  // @ts-ignore
  delete newUser.password;

  return newUser;
}
