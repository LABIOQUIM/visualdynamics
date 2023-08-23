import { z } from "zod";

export const MDConfigUpdateSchema = z.object({
  nsteps: z
    .string()
    .min(1, "admin-md-config:nsteps.errors.empty")
    .regex(/^\d+(\.\d+)*$/, "admin-md-config:nsteps.errors.nan")
    .refine(
      (v) => Number(v) > 299 && Number(v) <= 5000000,
      "admin-md-config:nsteps.errors.out-of-bounds"
    ),
  dt: z
    .string()
    .min(1, "admin-md-config:dt.errors.empty")
    .regex(/^\d+(\.\d+)*$/, "admin-md-config:dt.errors.nan")
    .refine(
      (v) => Number(v) > 0 && Number(v) <= 1,
      "admin-md-config:dt.errors.out-of-bounds"
    )
});

export type MDConfigUpdateSchemaType = z.infer<typeof MDConfigUpdateSchema>;
