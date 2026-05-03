import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";

import { withEnv } from "../test-utils/env.js";
import { PrismaService } from "../prisma.service.js";

import { MailerssController } from "./mailer.controller.js";
import { MailerService } from "./mailer.service.js";

function createController({
  mailService,
  prisma,
}: {
  mailService: Partial<MailerService>;
  prisma: any;
}) {
  return Test.createTestingModule({
    controllers: [MailerssController],
    providers: [
      {
        provide: MailerService,
        useValue: mailService,
      },
      {
        provide: PrismaService,
        useValue: prisma,
      },
    ],
  }).compile();
}

describe("MailerssController", () => {
  it("lists users ordered by creation time", async () => {
    const users = [{ id: "1", email: "a@example.com" }];
    const prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue(users),
      },
    };
    const module = await createController({
      mailService: { sendMail: vi.fn() },
      prisma,
    });

    await expect(module.get(MailerssController).listUsers()).resolves.toEqual(
      users,
    );
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("sends a single mail payload", async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const module = await createController({
      mailService: { sendMail },
      prisma: { user: { findMany: vi.fn() } },
    });
    const payload = {
      from: "from@example.com",
      to: "to@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    };

    await expect(
      module.get(MailerssController).sendMail(payload as any, {} as any),
    ).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalledWith(payload);
  });

  it("queues batch mail using default and configured sender values", async () => {
    const users = [{ email: "a@example.com" }, { email: "b@example.com" }];
    const prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue(users),
      },
    };
    const sendMail = vi.fn().mockResolvedValue(undefined);

    await withEnv({ SMTP_FROM: undefined }, async () => {
      const module = await createController({
        mailService: { sendMail },
        prisma,
      });

      await expect(
        module
          .get(MailerssController)
          .sendBatchMail({ subject: "Subj", html: "<p>Body</p>" }, {} as any),
      ).resolves.toEqual({ queued: 2 });
      expect(sendMail).toHaveBeenNthCalledWith(1, {
        from: "noreply@localhost",
        to: "a@example.com",
        subject: "Subj",
        html: "<p>Body</p>",
      });
    });

    sendMail.mockClear();

    await withEnv({ SMTP_FROM: "sender@example.com" }, async () => {
      const module = await createController({
        mailService: { sendMail },
        prisma,
      });

      await module
        .get(MailerssController)
        .sendBatchMail({ subject: "Subj", html: "<p>Body</p>" }, {} as any);
      expect(sendMail).toHaveBeenNthCalledWith(1, {
        from: "sender@example.com",
        to: "a@example.com",
        subject: "Subj",
        html: "<p>Body</p>",
      });
    });
  });
});
