"use server";
import { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type GetUsersProps = {
  searchByIdentifier: string;
  toTake: number;
  page: number;
};

export type GetUsersReturnProps = {
  count: number;
  users: Omit<User, "password">[];
};

export async function getUsers({
  page,
  searchByIdentifier,
  toTake
}: GetUsersProps): Promise<GetUsersReturnProps> {
  const where = {
    AND: [
      {
        active: true
      },
      {
        OR: [
          {
            email: { contains: searchByIdentifier }
          },
          {
            name: { contains: searchByIdentifier }
          },
          {
            username: { contains: searchByIdentifier }
          }
        ]
      }
    ]
  };

  const count = await prisma.user.count({
    where
  });

  const users = await prisma.user.findMany({
    where,
    orderBy: {
      username: "asc"
    },
    take: toTake,
    skip: toTake * (page - 1),
    select: {
      username: true,
      active: true,
      role: true,
      name: true,
      email: true,
      id: true,
      deleted: true
    }
  });

  return {
    count,
    users
  };
}
