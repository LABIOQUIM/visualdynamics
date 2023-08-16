import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";

import {
  MDConfigUpdateSchema,
  MDConfigUpdateSchemaType
} from "aold/components/admin/mdp-settings/schema.zod";
import { useMDPSettings } from "aold/components/admin/mdp-settings/useMDPSettings";
import { AlertFailedToFetch } from "aold/components/general/alerts/failed-to-fetch";
import { Button } from "aold/components/general/buttons";
import { Input } from "aold/components/general/forms/input";
import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { H2 } from "aold/components/general/typography/headings";
import { api } from "../../../lib/api";

export function FormMDPSettings() {
  const { data, refetch, isLoading } = useMDPSettings();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<MDConfigUpdateSchemaType>({
    resolver: zodResolver(MDConfigUpdateSchema)
  });
  const { t } = useTranslation();

  const handleSubmitDynamic: SubmitHandler<MDConfigUpdateSchemaType> = async (
    data
  ) => {
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
      .catch(() => alert("Não foi"));
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
      <H2>{t("admin-settings:md.title")}</H2>
      <Input
        label={t("admin-settings:md.nsteps")}
        error={errors.nsteps}
        disabled={isSubmitting}
        defaultValue={data.nsteps}
        type="number"
        min={300}
        max={5000000}
        step={100}
        {...register("nsteps")}
      />

      <Input
        label={t("admin-settings:md.dt")}
        error={errors.dt}
        disabled={isSubmitting}
        defaultValue={data.dt}
        type="number"
        min={0.001}
        max={1}
        step={0.001}
        {...register("dt")}
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
