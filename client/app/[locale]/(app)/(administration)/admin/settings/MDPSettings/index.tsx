"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  MDConfigUpdateSchema,
  MDConfigUpdateSchemaType
} from "@/app/[locale]/(administration)/admin/settings/MDPSettings/schema";
import { updateMDPSettings } from "@/app/[locale]/(administration)/admin/settings/MDPSettings/updateMDPSetting";
import { useMDPSettings } from "@/app/[locale]/(administration)/admin/settings/MDPSettings/useMDPSettings";
import { Button } from "@/components/Button";
import { Input } from "@/components/Forms/Input";
import { H2 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

export function MDPSettings() {
  const { data, refetch, isLoading } = useMDPSettings();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<MDConfigUpdateSchemaType>({
    resolver: zodResolver(MDConfigUpdateSchema)
  });
  const t = useI18n();

  const handleSubmitDynamic: SubmitHandler<MDConfigUpdateSchemaType> = async (
    data
  ) => {
    const formData = new FormData();

    formData.append("nsteps", data.nsteps);
    formData.append("dt", data.dt);

    updateMDPSettings(formData)
      .then(() => refetch())
      .catch(() => alert("Não foi"));
  };

  if (isLoading) {
    return null;
  }

  if (!data || data?.status === "not-found") {
    return null;
  }

  return (
    <form
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <H2>{t("admin.settings.md.title")}</H2>
      <Input
        label={t("admin.settings.md.nsteps")}
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
        label={t("admin.settings.md.dt")}
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
        {t("admin.settings.submit")}
      </Button>
    </form>
  );
}
