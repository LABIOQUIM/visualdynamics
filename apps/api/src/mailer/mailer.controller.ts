import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles, Session } from "@thallesp/nestjs-better-auth";

import { auth } from "../lib/auth";
import { PrismaService } from "../prisma.service";

import { MailerService } from "./mailer.service";
import { MailerBody } from "./mailer.types";

@Controller("mailer")
@Roles(["admin"])
export class MailerssController {
  constructor(
    private mailService: MailerService,
    private prisma: PrismaService,
  ) {}

  @Get("/users")
  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post("/")
  async sendMail(
    @Body() data: MailerBody,
    @Session() _session: typeof auth.$Infer.Session,
  ) {
    await this.mailService.sendMail(data);
  }

  @Post("/batch")
  async sendBatchMail(
    @Body()
    data: {
      to: string[];
      subject: string;
      html: string;
    },
    @Session() _session: typeof auth.$Infer.Session,
  ) {
    const from = process.env.SMTP_USER ?? "noreply@localhost";
    for (const recipient of data.to) {
      await this.mailService.sendMail({
        from,
        to: recipient,
        subject: data.subject,
        html: data.html,
      });
    }

    return { queued: data.to.length };
  }
}
