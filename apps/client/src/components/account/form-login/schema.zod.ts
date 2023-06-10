import { z } from "zod";

export const SignInFormSchema = z.object({
  identifier: z.string().min(1, "account-loginidentifier.errors.empty"),
  password: z.string().min(1, "account-loginpassword.errors.empty")
});

export type SignInFormSchemaType = z.infer<typeof SignInFormSchema>;
