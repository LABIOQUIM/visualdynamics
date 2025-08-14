import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { SimulationModule } from "./simulations/simulation.module";
import { SystemInfoModule } from "./systeminfo/systeminfo.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: "redis",
        port: 6379,
      },
      defaultJobOptions: {
        // attempts: 1,
      },
    }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
    }),
    SimulationModule,
    SystemInfoModule,
  ],
})
export class AppModule {}
