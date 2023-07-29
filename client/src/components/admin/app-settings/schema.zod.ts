import { z } from "zod";

export const AppSettingsUpdateSchema = z.object({
  maintenanceMode: z.boolean()
});

export type AppSettingsUpdateSchemaType = z.infer<
  typeof AppSettingsUpdateSchema
>;
