"use server";
import { argon2id, hash } from "argon2";
import axios from "axios";
import { prisma } from "database";

import { normalizeString } from "@/utils/normalizeString";

export async function registerUser(data: RegisterFormInputs) {
  try {
    data.userName = normalizeString(data.userName);

    data.password = await hash(data.password, { type: argon2id });

    const user = await prisma.user.create({
      data,
    });

    const userActivation = await prisma.userEmailValidation.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await axios.post("http://mailer:3000/send-email", {
      from: `LABIOQUIM <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: "[LABIOQUIM] Your registration",
      template: "activation.hbs",
      context: {
        name: data.firstName,
        username: data.userName,
        activationURL: `${process.env.APP_URL}/activate/${userActivation.id}`,
      },
    });

    return "success";
  } catch (e: any) {
    if (e && e.code && e.code === "P2002") {
      return "existing-user";
    }

    console.log(e);

    return "unknown-error";
  }
}
