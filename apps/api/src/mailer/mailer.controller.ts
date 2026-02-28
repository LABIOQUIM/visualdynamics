import { Body, Controller, Post } from "@nestjs/common";

import { MailerService } from "./mailer.service";
import { MailerBody } from "./mailer.types";

@Controller("mailer")
export class MailerssController {
  constructor(private mailService: MailerService) {}

  @Post("/")
  async sendMail(@Body() data: MailerBody) {
    this.mailService.sendMail(data);
  }
}
