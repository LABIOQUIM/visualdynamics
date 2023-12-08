"use server";

import { prisma } from "@/lib/prisma";

import { AppSettingsUpdateSchemaType } from "./schema";

export async function updateAppSettings(
  id: string,
  data: AppSettingsUpdateSchemaType
) {
  await prisma.appSettings.update({
    where: {
      id
    },
    data
  });
}
