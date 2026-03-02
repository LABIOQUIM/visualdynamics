import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { AuthModule } from "@thallesp/nestjs-better-auth";

import { auth } from "./lib/auth";
import { MailerModule } from "./mailer/mailer.module";
import { SimulationModule } from "./simulation/simulation.module";
import { SystemInfoModule } from "./systeminfo/systeminfo.module";

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
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
  ],
})
export class AppModule {}
