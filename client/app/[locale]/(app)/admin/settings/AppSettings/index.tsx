"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateAppSettings } from "@/app/[locale]/(app)/admin/settings/AppSettings/updateAppSettings";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Forms/Switch";
import { H2 } from "@/components/Typography";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useI18n } from "@/locales/client";

import { AppSettingsUpdateSchema, AppSettingsUpdateSchemaType } from "./schema";

export function AppSettings() {
  const { data, refetch, isLoading } = useAppSettings();
  const {
    formState: { isSubmitting },
    handleSubmit,
    setValue,
    watch
  } = useForm<AppSettingsUpdateSchemaType>({
    resolver: zodResolver(AppSettingsUpdateSchema)
  });
  const t = useI18n();

  const handleSubmitDynamic: SubmitHandler<
    AppSettingsUpdateSchemaType
  > = async (form) => {
    if (data) {
      updateAppSettings(data.id, form).then(() => refetch());
    }
  };

  if (isLoading) {
    return null;
  }

  if (!data) {
    return null;
  }

  return (
    <form
      className="flex flex-col justify-between gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <H2>{t("admin.settings.app.title")}</H2>
      <Switch
        label={t("admin.settings.app.maintenanceMode")}
        checked={watch("maintenanceMode")}
        defaultChecked={data.maintenanceMode}
        onCheckedChange={(bool) => setValue("maintenanceMode", bool)}
        name="maintenanceMode"
      />

      <Button
        disabled={isSubmitting}
        type="submit"
      >
        {t("admin.settings.submit")}
      </Button>
    </form>
  );
}
