import { z } from "zod";

import { boxTypes } from "@app/utils/box-types";
import { forceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export const APOFormSchema = z.object({
  protein: z.custom<File>((v) => v instanceof File),
  forceField: z.custom<keyof typeof forceFields>(),
  boxType: z.custom<keyof typeof boxTypes>(),
  waterModel: z.custom<keyof typeof waterModels>()
});

export type APOFormSchemaType = z.infer<typeof APOFormSchema>;
