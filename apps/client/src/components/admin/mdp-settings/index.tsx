import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";

import {
  MDConfigUpdateSchema,
  MDConfigUpdateSchemaType
} from "@app/components/admin/mdp-settings/schema.zod";
import { useMDPSettings } from "@app/components/admin/mdp-settings/useMDPSettings";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { Button } from "@app/components/general/buttons";
import { Input } from "@app/components/general/forms/input";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { H2 } from "@app/components/general/typography/headings";
import { api } from "@app/lib/api";

export function FormMDPSettings() {
  const { data, refetch, isLoading } = useMDPSettings();
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<MDConfigUpdateSchemaType>({
    resolver: zodResolver(MDConfigUpdateSchema)
  });
  const { t } = useTranslation();

  const handleSubmitDynamic: SubmitHandler<MDConfigUpdateSchemaType> = async (
    data
  ) => {
    setIsUpdating(true);
    const formData = new FormData();

    formData.append("nsteps", data.nsteps);
    formData.append("dt", data.dt);

    await api
      .put("/mdpr", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(() => refetch())
      .catch(() => alert("Não foi"))
      .finally(() => setIsUpdating(false));
  };

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (!data || data?.status === "not-found") {
    return <AlertFailedToFetch />;
  }

  return (
    <form
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <H2>{t("admin-settings:md-config.title")}</H2>
      <Input
        label={t("admin-settings:md-config.nsteps.title")}
        error={errors.nsteps}
        disabled={isUpdating}
        defaultValue={data.nsteps}
        type="number"
        min={300}
        max={5000000}
        step={100}
        {...register("nsteps")}
      />

      <Input
        label={t("admin-settings:md-config.dt.title")}
        error={errors.dt}
        disabled={isUpdating}
        defaultValue={data.dt}
        type="number"
        min={0.001}
        max={1}
        step={0.001}
        {...register("dt")}
      />

      <Button
        disabled={isUpdating}
        type="submit"
      >
        {t("admin-settings:md-config.submit")}
      </Button>
    </form>
  );
}
