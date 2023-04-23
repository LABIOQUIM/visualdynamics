import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudCog, Download } from "lucide-react";
import { useRouter } from "next/router";
import { User } from "next-auth";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { Select } from "@app/components/Select";
import { Switch } from "@app/components/Switch";
import { api } from "@app/lib/api";
import {
  PRODRGFormSchema,
  PRODRGFormSchemaType
} from "@app/schemas/pages/dynamic/prodrg.zod";
import { boxTypes } from "@app/utils/box-types";
import { prodrgForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

interface PRODRGFormProps {
  user: User;
}

export function PRODRGForm({ user }: PRODRGFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<PRODRGFormSchemaType>({
    resolver: zodResolver(PRODRGFormSchema),
    defaultValues: {
      neutralize: true,
      ignore: true,
      double: false
    }
  });
  const router = useRouter();
  const { t } = useTranslation(["forms"]);

  const handleSubmitDynamic: SubmitHandler<PRODRGFormSchemaType> = async (
    data
  ) => {
    const formData = new FormData();

    formData.append("file_pdb", data.protein[0]);
    formData.append("file_itp", data.ligandItp[0]);
    formData.append("file_gro", data.ligandGro[0]);
    formData.append("force_field", data.forceField);
    formData.append("water_model", data.waterModel);
    formData.append("box_type", data.boxType);
    formData.append("box_distance", data.boxDistance);
    formData.append("bootstrap", data.bootstrap ? "true" : "false");
    formData.append("neutralize", data.neutralize ? "true" : "false");
    formData.append("double", data.double ? "true" : "false");
    formData.append("ignore", data.ignore ? "true" : "false");
    formData.append("username", user.username);

    await api
      .post("/prodrg", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(async ({ data }) => {
        if (data.status === "generated") {
          await api
            .post(
              "/run",
              {
                folder: data.folder
              },
              {
                headers: {
                  "Content-Type": "multipart/form-data"
                }
              }
            )
            .then(() => router.push("/dynamic/running"))
            .catch(() => alert("not running"));
        } else if (data.status === "commands") {
          const link = document.createElement("a");
          link.download = "dynamic-commands.txt";
          link.href =
            "data:text/plain;charset=utf-8," +
            encodeURIComponent(data.commands.join(""));
          link.click();
        }
      })
      .catch(() => alert("Não foi"));
  };

  return (
    <form
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <Input
        label={t("forms:file-pdb.title")}
        type="file"
        accept=".pdb"
        error={errors.protein}
        {...register("protein")}
      />

      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <Input
          label={t("forms:file-itp.title")}
          type="file"
          accept=".itp,.gro"
          error={errors.ligandItp}
          {...register("ligandItp")}
        />

        <Input
          label={t("forms:file-gro.title")}
          type="file"
          accept=".pdb,.gro"
          error={errors.ligandGro}
          {...register("ligandGro")}
        />
      </div>

      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <Select<keyof typeof prodrgForceFields>
          error={errors.forceField}
          label={t("forms:force-field.title")}
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder={t("forms:force-field.placeholder")}
          selectedValue={watch("forceField")}
          values={prodrgForceFields}
        />

        <Select<keyof typeof waterModels>
          error={errors.waterModel}
          label={t("forms:water-model.title")}
          name="waterModel"
          onChange={(newWaterModel) => setValue("waterModel", newWaterModel)}
          placeholder={t("forms:water-model.placeholder")}
          selectedValue={watch("waterModel")}
          values={waterModels}
        />
      </div>

      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <Select<keyof typeof boxTypes>
          error={errors.boxType}
          label={t("forms:box-type.title")}
          name="boxType"
          onChange={(newBoxType) => setValue("boxType", newBoxType)}
          placeholder={t("forms:box-type.placeholder")}
          selectedValue={watch("boxType")}
          values={boxTypes}
        />

        <Input
          label={t("forms:box-distance.title")}
          error={errors.boxDistance}
          type="number"
          {...register("boxDistance")}
        />
      </div>

      <label>{t("forms:options")}</label>
      <div className="flex flex-col gap-y-2">
        <Switch
          label={t("forms:neutralize.title")}
          checked={watch("neutralize")}
          onCheckedChange={(bool) => setValue("neutralize", bool)}
          name="neutralize"
          disabled
        />

        <Switch
          label={t("forms:ignore.title")}
          checked={watch("ignore")}
          onCheckedChange={(bool) => setValue("ignore", bool)}
          name="ignore"
          disabled
        />

        <Switch
          label={t("forms:double.title")}
          checked={watch("double")}
          onCheckedChange={(bool) => setValue("double", bool)}
          name="double"
          disabled
        />

        <Switch
          label={t("forms:run.title")}
          checked={watch("bootstrap")}
          onCheckedChange={(bool) => setValue("bootstrap", bool)}
          name="bootstrap"
        />
      </div>
      <Button
        disabled
        LeftIcon={watch("bootstrap") === true ? CloudCog : Download}
        type="submit"
      >
        {watch("bootstrap") === true
          ? t("forms:submit.run")
          : t("forms:submit.download")}
      </Button>
    </form>
  );
}
