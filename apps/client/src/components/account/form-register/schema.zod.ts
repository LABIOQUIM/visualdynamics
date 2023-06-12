import { z } from "zod";

export const SignUpFormSchema = z.object({
  username: z
    .string()
    .min(1, "account-register:username.errors.empty")
    .regex(
      new RegExp("^[a-zA-Z0-9]{4,10}$"),
      "account-register:username.errors.invalid"
    ),
  email: z
    .string()
    .min(1, "account-register:email.errors.empty")
    .email("account-register:email.errors.invalid")
    .regex(
      new RegExp(
        "[a-z0-9]+@(?!gmail|yahoo|qq|yandex|hotmail|outlook|123|126|163).[a-z0-9]+"
      ),
      "account-register:email.errors.disallowed"
    ),
  password: z.string().min(1, "account-register:password.errors.empty")
});

export type SignUpFormSchemaType = z.infer<typeof SignUpFormSchema>;
