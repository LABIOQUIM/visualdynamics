import { z } from "zod";

import { boxTypes } from "@app/utils/box-types";
import { acpypeForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export const ACPYPEFormSchema = z.object({
  // @ts-ignore
  protein: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "forms:file-pdb.errors.no-pdb"
  }),
  // @ts-ignore
  ligandItp: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "forms:file-itp.errors.no-itp"
  }),
  // @ts-ignore
  ligandGro: z.custom<FileList>((v) => v[0] instanceof File, {
    message: "forms:file-gro.errors.no-gro"
  }),
  forceField: z.custom<keyof typeof acpypeForceFields>(
    (v) => Object.keys(acpypeForceFields).includes(v as string),
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
    .min(0, "forms:box-distance.errors.distance-cant-be-zero"),
  neutralize: z.boolean().default(true),
  ignore: z.boolean().default(true),
  double: z.boolean().default(false),
  bootstrap: z.boolean().default(false)
});

export type ACPYPEFormSchemaType = z.infer<typeof ACPYPEFormSchema>;
