import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles, Session } from "@thallesp/nestjs-better-auth";

import { auth } from "../lib/auth.js";
import { PrismaService } from "../prisma.service.js";

import { MailerService } from "./mailer.service.js";
import { MailerBody } from "./mailer.types.js";

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
      subject: string;
      html: string;
    },
    @Session() _session: typeof auth.$Infer.Session,
  ) {
    const users = await this.prisma.user.findMany({
      select: { email: true },
    });

    const from = process.env.SMTP_FROM ?? "noreply@localhost";
    for (const user of users) {
      await this.mailService.sendMail({
        from,
        to: user.email,
        subject: data.subject,
        html: data.html,
      });
    }

    return { queued: users.length };
  }
}
