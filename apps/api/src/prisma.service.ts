import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client.js";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASS;
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const name = process.env.DB_DATABASE;

    const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${name}`;

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }
}
