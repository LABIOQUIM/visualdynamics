import { Processor, WorkerHost } from "@nestjs/bullmq";
import { MailerService } from "@nestjs-modules/mailer";
import { Job } from "bullmq";

import { MailerBody } from "./mailer.types.js";

@Processor("mailer")
export class MailerConsumer extends WorkerHost {
  constructor(private mailService: MailerService) {
    super();
  }

  async process(job: Job<MailerBody>) {
    const { data } = job;

    await this.mailService.sendMail({
      to: data.to,
      from: data.from,
      subject: data.subject,
      ...(data.html
        ? { html: data.html }
        : {
            template: `/templates/${data.template}`,
            ...(data.context ? { context: data.context } : {}),
          }),
    });
  }
}
