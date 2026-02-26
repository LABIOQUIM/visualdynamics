import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@thallesp/nestjs-better-auth";

import { auth } from "./lib/auth";
import { SimulationModule } from "./simulation/simulation.module";
import { SystemInfoModule } from "./systeminfo/systeminfo.module";

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
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
      adapter: ExpressAdapter,
    }),
    SimulationModule,
    SystemInfoModule,
  ],
})
export class AppModule {}
