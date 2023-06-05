import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  requireTLS: true,
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
