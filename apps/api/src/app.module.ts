import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { AuthModule } from "@thallesp/nestjs-better-auth";

import { FeatureFlagModule } from "./feature-flag/feature-flag.module.js";
import { auth } from "./lib/auth.js";
import { MailerModule } from "./mailer/mailer.module.js";
import { SimulationModule } from "./simulation/simulation.module.js";
import { SystemInfoModule } from "./systeminfo/systeminfo.module.js";

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? "redis",
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
      defaultJobOptions: {
        // attempts: 1,
      },
    }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    MailerModule,
    NestMailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          port: Number(process.env.SMTP_PORT),
        },
        defaults: {
          port: Number(process.env.SMTP_PORT),
        },
        template: {
          dir: "/templates",
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    SimulationModule,
    SystemInfoModule,
    FeatureFlagModule,
  ],
})
export class AppModule {}
