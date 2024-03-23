import { prisma } from ".";

import type { Prisma } from "@prisma/client";
import { generateRandomString, generateScryptHash } from "./utils/crypto";

const DEFAULT_USERS: Prisma.UserCreateInput[] = [
  {
    email: 'ivoprovensi1@gmail.com',
    firstName: 'ivo',
    lastName: 'vieira',
    status: 'ACTIVE',
    role: 'ADMINISTRATOR',
    username: 'ivopr',
    id: generateRandomString(6)
  },
];

(async () => {
  try {
    const hashed_password = await generateScryptHash("12345");

    await Promise.all(
      DEFAULT_USERS.map((user) =>
        prisma.user.create({
          data: {
            ...user,
            key: {
              ...user.key,
              create: {
                id: generateRandomString(6),
                hashed_password
              }
            }
          },
        })
      )
    ).then(() => console.log("Seeded!"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();