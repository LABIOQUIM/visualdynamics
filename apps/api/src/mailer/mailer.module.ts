import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { MailerConsumer } from "./mailer.consumer";
import { MailerssController } from "./mailer.controller";
import { MailerService } from "./mailer.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "mailer",
    }),
    BullBoardModule.forFeature({
      adapter: BullMQAdapter,
      name: "mailer",
      options: {
        description: "The Mailer Queue runs all the email sending tasks.",
      },
    }),
  ],
  controllers: [MailerssController],
  providers: [MailerService, MailerConsumer],
})
export class MailerModule {}
