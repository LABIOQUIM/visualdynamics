import { z } from "zod";

export const ResetPasswordRequestFormSchema = z.object({
  identifier: z
    .string()
    .min(1, "account-recover:request-form.identifier.errors.empty")
});

export type ResetPasswordRequestFormSchemaType = z.infer<
  typeof ResetPasswordRequestFormSchema
>;
