import { z } from "zod";

import { boxTypes } from "@app/utils/box-types";
import { prodrgForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export const PRODRGFormSchema = z.object({
  // @ts-ignore
  protein: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "simulations-form:file-pdb.errors.no-pdb"
  }),
  // @ts-ignore
  ligandItp: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "simulations-form:file-itp.errors.no-itp"
  }),
  // @ts-ignore
  ligandGro: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "simulations-form:file-gro.errors.no-gro"
  }),
  forceField: z.custom<keyof typeof prodrgForceFields>(
    (v) => Object.keys(prodrgForceFields).includes(v as string),
    { message: "simulations-form:force-field.errors.no-force-field" }
  ),
  boxType: z.custom<keyof typeof boxTypes>(
    (v) => Object.keys(boxTypes).includes(v as string),
    { message: "simulations-form:box-type.errors.no-box-type" }
  ),
  waterModel: z.custom<keyof typeof waterModels>(
    (v) => Object.keys(waterModels).includes(v as string),
    { message: "simulations-form:water-model.errors.no-water-model" }
  ),
  boxDistance: z
    .string()
    .regex(
      new RegExp("^\\d+(\\.\\d+)*$"),
      "simulations-form:box-distance.errors.distance-doesnt-match"
    )
    .refine(
      (v) => Number(v) > 0 && Number(v) <= 1,
      "simulations-form:box-distance.errors.out-of-bounds"
    ),
  neutralize: z.boolean().default(true),
  ignore: z.boolean().default(true),
  double: z.boolean().default(false),
  bootstrap: z.boolean().default(false)
});

export type PRODRGFormSchemaType = z.infer<typeof PRODRGFormSchema>;
