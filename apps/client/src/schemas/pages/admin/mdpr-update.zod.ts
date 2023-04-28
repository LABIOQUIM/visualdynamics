import { z } from "zod";

export const AdminMDPRUpdateFormSchema = z.object({
  nsteps: z
    .string()
    .min(1, "admin-mdpr-update:nsteps.errors.empty")
    .regex(
      new RegExp("^\\d+(\\.\\d+)*$"),
      "admin-mdpr-update:nsteps.errors.nan"
    )
    .refine(
      (v) => Number(v) > 299 && Number(v) <= 5000000,
      "admin-mdpr-update:nsteps.errors.out-of-bounds"
    ),
  dt: z
    .string()
    .min(1, "admin-mdpr-update:dt.errors.empty")
    .regex(new RegExp("^\\d+(\\.\\d+)*$"), "admin-mdpr-update:dt.errors.nan")
    .refine(
      (v) => Number(v) > 0 && Number(v) <= 1,
      "admin-mdpr-update:dt.errors.out-of-bounds"
    )
});

export type AdminMDPRUpdateFormSchemaType = z.infer<
  typeof AdminMDPRUpdateFormSchema
>;
