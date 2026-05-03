import { describe, expect, it, vi } from "vitest";

import { MailerService } from "./mailer.service.js";

describe("MailerService", () => {
  it("enqueues outbound mail", async () => {
    const add = vi.fn().mockResolvedValue(undefined);
    const service = new MailerService({ add } as any);
    const payload = {
      from: "from@example.com",
      to: "to@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    };

    await expect(service.sendMail(payload as any)).resolves.toBeUndefined();
    expect(add).toHaveBeenCalledWith("send-mail", payload);
  });
});
