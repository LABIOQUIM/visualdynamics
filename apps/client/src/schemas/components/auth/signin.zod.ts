import { z } from "zod";

export const SignInFormSchema = z.object({
  identifier: z.string().min(1, "signin:identifier.errors.empty"),
  password: z.string().min(1, "signin:password.errors.empty")
});

export type SignInFormSchemaType = z.infer<typeof SignInFormSchema>;
