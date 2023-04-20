import { z } from "zod";

export const AuthFormSchema = z.object({
  identifier: z.string().min(1, "navigation:forms.identifier.errors.empty"),
  password: z.string().min(1, "navigation:forms.password.errors.empty")
});

export type AuthFormSchemaType = z.infer<typeof AuthFormSchema>;
