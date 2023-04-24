import { z } from "zod";

import { boxTypes } from "@app/utils/box-types";
import { apoForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export const APOFormSchema = z.object({
  // @ts-ignore
  protein: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "forms:file-pdb.errors.no-pdb"
  }),
  forceField: z.custom<keyof typeof apoForceFields>(
    (v) => Object.keys(apoForceFields).includes(v as string),
    { message: "forms:force-field.errors.no-force-field" }
  ),
  boxType: z.custom<keyof typeof boxTypes>(
    (v) => Object.keys(boxTypes).includes(v as string),
    { message: "forms:box-type.errors.no-box-type" }
  ),
  waterModel: z.custom<keyof typeof waterModels>(
    (v) => Object.keys(waterModels).includes(v as string),
    { message: "forms:water-model.errors.no-water-model" }
  ),
  boxDistance: z
    .string()
    .regex(
      new RegExp("^\\d+(\\.\\d+)*$"),
      "forms:box-distance.errors.distance-doesnt-match"
    )
    .refine(
      (v) => Number(v) > 0 && Number(v) <= 1,
      "forms:box-distance.errors.out-of-bounds"
    ),
  neutralize: z.boolean().default(true),
  ignore: z.boolean().default(true),
  double: z.boolean().default(false),
  bootstrap: z.boolean().default(false)
});

export type APOFormSchemaType = z.infer<typeof APOFormSchema>;
