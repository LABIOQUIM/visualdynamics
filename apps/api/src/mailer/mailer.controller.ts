import { Body, Controller, Post } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";

import { auth } from "../lib/auth";

import { MailerService } from "./mailer.service";
import { MailerBody } from "./mailer.types";

type AuthSession = typeof auth.$Infer.Session;

@Controller("mailer")
export class MailerController {
  constructor(private mailService: MailerService) {}

  @Post("/")
  async sendMail(
    @Session() _session: AuthSession,
    @Body() data: MailerBody,
  ) {
    await this.mailService.sendMail(data);
  }
}
