import { hash } from "argon2";

import { prisma } from "@/lib/prisma";

async function main() {
  console.log("STARTED SEEDING");
  try {
    console.log("USER SEEDING");
    await prisma.user.create({
      data: {
        email: "visualdynamics@fiocruz.br",
        name: "Admin",
        password: await hash("admin"),
        username: "admin",
        active: true,
        role: "ADMIN"
      }
    });

    console.log("CREATED ADMIN");
  } catch (e) {
    console.log(e);
  }

  try {
    await prisma.appSettings.create({
      data: {
        maintenanceMode: false
      }
    });

    console.log("APPSETTINGS CREATED");
  } catch (e) {
    console.log(e);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
