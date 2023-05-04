import { z } from "zod";

export const ResetPasswordFormSchema = z.object({
  resetId: z.string().uuid(),
  password: z
    .string()
    .min(6, "reset-password:reset-form.password.errors.min-length")
});

export type ResetPasswordFormSchemaType = z.infer<
  typeof ResetPasswordFormSchema
>;
