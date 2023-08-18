"use server";

import { AppSettings } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getAppSettings(): Promise<AppSettings> {
  const appSettings = await prisma.appSettings.findMany();

  if (appSettings.length > 0) {
    return appSettings[0];
  }

  return {
    id: "fake-id",
    maintenanceMode: false
  };
}
