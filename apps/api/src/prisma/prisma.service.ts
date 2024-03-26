import { INestApplication, Injectable } from "@nestjs/common";
import { PrismaClient } from "database";

@Injectable()
export class PrismaService extends PrismaClient {
  async enableShutdownHooks(app: INestApplication) {
    // @ts-expect-error
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
