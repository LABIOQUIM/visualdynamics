import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST ?? "redis",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

const mailQueue = new Queue("mailer", { connection });

export async function sendEmail(email: {
  to: string;
  subject: string;
  html: string;
}) {
  await mailQueue.add("send-mail", {
    from: process.env.SMTP_FROM ?? "noreply@visualdynamics.com",
    to: email.to,
    subject: email.subject,
    html: email.html,
  });
}
