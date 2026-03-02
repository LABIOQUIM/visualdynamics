import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Job } from "bullmq";

import { MailerBody } from "./mailer.types";

@Processor("mailer")
export class MailerConsumer extends WorkerHost {
  private readonly logger = new Logger(MailerConsumer.name);

  constructor(private mailService: MailerService) {
    super();
  }

  async process(job: Job<MailerBody>) {
    const { data } = job;

    try {
      await this.mailService.sendMail({
        to: data.to,
        from: data.from,
        subject: data.subject,
        template: `/templates/${data.template}`,
        context: data.context,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email for job ${job.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
