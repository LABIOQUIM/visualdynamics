import { z } from "zod";

export const SignInFormSchema = z.object({
  identifier: z.string().min(1, "account-login:identifier.errors.empty"),
  password: z.string().min(1, "account-login:password.errors.empty")
});

export type SignInFormSchemaType = z.infer<typeof SignInFormSchema>;
