import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

import { MailerBody } from "./mailer.types.js";

@Injectable()
export class MailerService {
  constructor(@InjectQueue("mailer") private mailQueue: Queue) {}

  async sendMail(email: MailerBody) {
    await this.mailQueue.add("send-mail", email);
  }
}
