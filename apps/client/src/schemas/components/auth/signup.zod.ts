import { z } from "zod";

export const SignUpFormSchema = z.object({
  username: z.string().min(1, "signup:username.errors.empty"),
  email: z
    .string()
    .min(1, "signup:email.errors.empty")
    .email("signup:email.errors.invalid")
    .regex(
      new RegExp(
        "[a-z0-9]+@(?!gmail|yahoo|qq|yandex|hotmail|outlook|123|126|163).[a-z0-9]+"
      ),
      "signup:email.errors.disallowed"
    ),
  password: z.string().min(1, "signup:password.errors.empty")
});

export type SignUpFormSchemaType = z.infer<typeof SignUpFormSchema>;
