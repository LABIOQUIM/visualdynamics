import { describe, expect, it } from "vitest";

describe("MailerModule", () => {
  it("exports the module class", async () => {
    const { MailerModule } = await import("./mailer.module.js");

    expect(MailerModule).toBeDefined();
  });
});
