import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import useTranslation from "next-translate/useTranslation";

import {
  AppSettingsUpdateSchema,
  AppSettingsUpdateSchemaType
} from "@app/components/admin/app-settings/schema.zod";
import { useAppSettings } from "@app/components/admin/app-settings/useAppSettings";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { Button } from "@app/components/general/buttons";
import { Switch } from "@app/components/general/forms/switch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { H2 } from "@app/components/general/typography/headings";

export function FormAppSettings() {
  const { data, refetch, isLoading } = useAppSettings();
  const {
    formState: { isSubmitting },
    handleSubmit,
    setValue,
    watch
  } = useForm<AppSettingsUpdateSchemaType>({
    resolver: zodResolver(AppSettingsUpdateSchema)
  });
  const { t } = useTranslation();

  const handleSubmitDynamic: SubmitHandler<
    AppSettingsUpdateSchemaType
  > = async (form) => {
    await axios
      .put("/api/app/settings", {
        id: data?.id ?? "",
        maintenanceMode: form.maintenanceMode
      })
      .then(() => refetch())
      .catch(() => alert("Não foi"));
  };

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (!data) {
    return <AlertFailedToFetch />;
  }

  return (
    <form
      className="flex flex-col justify-between gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <H2>{t("admin-settings:app.title")}</H2>
      <Switch
        label={t("admin-settings:app.maintenanceMode")}
        checked={watch("maintenanceMode")}
        defaultChecked={data.maintenanceMode}
        onCheckedChange={(bool) => setValue("maintenanceMode", bool)}
        name="maintenanceMode"
      />

      <Button
        disabled={isSubmitting}
        type="submit"
      >
        {t("admin-settings:submit")}
      </Button>
    </form>
  );
}
