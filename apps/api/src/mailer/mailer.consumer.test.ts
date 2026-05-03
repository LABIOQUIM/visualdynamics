import { describe, expect, it, vi } from "vitest";

import { MailerConsumer } from "./mailer.consumer.js";

describe("MailerConsumer", () => {
  it("sends direct html emails", async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const consumer = new MailerConsumer({ sendMail } as any);

    await expect(
      consumer.process({
        data: {
          to: "to@example.com",
          from: "from@example.com",
          subject: "Hello",
          html: "<p>Hi</p>",
        },
      } as any),
    ).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalledWith({
      to: "to@example.com",
      from: "from@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });
  });

  it("renders template emails with and without context", async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const consumer = new MailerConsumer({ sendMail } as any);

    await consumer.process({
      data: {
        to: "to@example.com",
        from: "from@example.com",
        subject: "Hello",
        template: "welcome",
        context: { name: "Ivo" },
      },
    } as any);

    await consumer.process({
      data: {
        to: "to2@example.com",
        from: "from@example.com",
        subject: "Hello",
        template: "reset",
      },
    } as any);

    expect(sendMail).toHaveBeenNthCalledWith(1, {
      to: "to@example.com",
      from: "from@example.com",
      subject: "Hello",
      template: "/templates/welcome",
      context: { name: "Ivo" },
    });
    expect(sendMail).toHaveBeenNthCalledWith(2, {
      to: "to2@example.com",
      from: "from@example.com",
      subject: "Hello",
      template: "/templates/reset",
    });
  });
});
