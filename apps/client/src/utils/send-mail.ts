import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default sendMail;
