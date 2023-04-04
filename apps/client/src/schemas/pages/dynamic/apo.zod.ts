import { z } from "zod";

import { boxTypes } from "@app/utils/box-types";
import { forceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export const APOFormSchema = z.object({
  // @ts-ignore
  protein: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "features:dynamic.forms.errors.no-pdb"
  }),
  forceField: z.custom<keyof typeof forceFields>(
    (v) => Object.keys(forceFields).includes(v as string),
    { message: "features.dynamic.forms.errors.no-force-field" }
  ),
  boxType: z.custom<keyof typeof boxTypes>(
    (v) => Object.keys(boxTypes).includes(v as string),
    { message: "features.dynamic.forms.errors.no-box-type" }
  ),
  waterModel: z.custom<keyof typeof waterModels>(
    (v) => Object.keys(waterModels).includes(v as string),
    { message: "features.dynamic.forms.errors.no-water-model" }
  ),
  boxDistance: z
    .string()
    .regex(
      new RegExp("^\\d+(\\.\\d+)*$"),
      "features.dynamic.errors.distance-doesnt-match"
    )
    .min(0, "features.dynamic.forms.errors.distance-cant-be-zero"),
  neutralize: z.boolean().default(true),
  ignore: z.boolean().default(true),
  double: z.boolean().default(false),
  bootstrap: z.boolean().default(false)
});

export type APOFormSchemaType = z.infer<typeof APOFormSchema>;
