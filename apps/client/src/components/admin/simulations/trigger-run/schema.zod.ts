import { z } from "zod";

export const TriggerRunFormSchema = z.object({
  folder: z.string().min(1, "admin-simulations:trigger-run.form.folder.empty"),
  email: z
    .string()
    .min(1, "admin-simulations:trigger-run.form.email.empty")
    .email("admin-simulations:trigger-run.form.email.invalid")
});

export type TriggerRunFormSchemaType = z.infer<typeof TriggerRunFormSchema>;
