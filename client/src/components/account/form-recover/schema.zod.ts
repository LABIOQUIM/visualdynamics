import { z } from "zod";

export const ResetPasswordFormSchema = z.object({
  resetId: z.string().uuid(),
  password: z
    .string()
    .min(6, "account-recover:reset-form.password.errors.min-length")
});

export type ResetPasswordFormSchemaType = z.infer<
  typeof ResetPasswordFormSchema
>;
