import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";

import {
  MDConfigUpdateSchema,
  MDConfigUpdateSchemaType
} from "@app/components/admin/md-config/schema.zod";
import { GetMDConfigResult } from "@app/components/admin/md-config/useMDConfig";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { Button } from "@app/components/general/buttons";
import { Input } from "@app/components/general/forms/input";
import { api } from "@app/lib/api";

interface MDConfigProps {
  data: GetMDConfigResult;
  refetch: () => void;
}

export function FormMDConfig({ data, refetch }: MDConfigProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<MDConfigUpdateSchemaType>({
    resolver: zodResolver(MDConfigUpdateSchema),
    defaultValues: {
      dt: data.status === "found" ? String(data.dt) : "0",
      nsteps: data.status === "found" ? String(data.nsteps) : "0"
    }
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

  if (data?.status === "not-found") {
    return <AlertFailedToFetch />;
  }

  return (
    <form
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <Input
        label={t("admin-md-config:nsteps.title")}
        error={errors.nsteps}
        disabled={isUpdating}
        type="number"
        min={300}
        max={5000000}
        step={100}
        {...register("nsteps")}
      />

      <Input
        label={t("admin-md-config:dt.title")}
        error={errors.dt}
        disabled={isUpdating}
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
        {t("admin-md-config:submit")}
      </Button>
    </form>
  );
}
