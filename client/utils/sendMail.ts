"use server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  secure: Boolean(Number(process.env.EMAIL_SMTP_SECURE)),
  requireTLS: Boolean(Number(process.env.EMAIL_SMTP_REQUIRE_TLS)),
  auth: {
    user: process.env.EMAIL_NO_REPLY,
    pass: process.env.EMAIL_PASS
  }
});

type SendMailProps = {
  to: string | string[];
  subject: string;
  html: string;
};

const sendMail = async ({ to, subject, html }: SendMailProps) => {
  const mailOptions = {
    from: `"⚛️ Visual Dynamics" ${process.env.EMAIL_NO_REPLY}`,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default sendMail;
