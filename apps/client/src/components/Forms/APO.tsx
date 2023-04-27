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
  APOFormSchema,
  APOFormSchemaType
} from "@app/schemas/pages/dynamic/apo.zod";
import { boxTypes } from "@app/utils/box-types";
import { apoForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

interface APOFormProps {
  user: User;
}

export function APOForm({ user }: APOFormProps) {
  const { t } = useTranslation(["forms"]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<APOFormSchemaType>({
    resolver: zodResolver(APOFormSchema),
    defaultValues: {
      neutralize: true,
      ignore: true,
      double: false
    }
  });

  const router = useRouter();

  const handleSubmitDynamic: SubmitHandler<APOFormSchemaType> = async (
    data
  ) => {
    const formData = new FormData();

    formData.append("file_pdb", data.protein[0]);
    formData.append("force_field", data.forceField);
    formData.append("water_model", data.waterModel);
    formData.append("box_type", data.boxType);
    formData.append("box_distance", data.boxDistance);
    formData.append("bootstrap", data.bootstrap === true ? "true" : "false");
    formData.append("neutralize", data.neutralize === true ? "true" : "false");
    formData.append("double", data.double === true ? "true" : "false");
    formData.append("ignore", data.ignore === true ? "true" : "false");
    formData.append("username", user.username);

    await api
      .post("/generate/apo", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(async ({ data }) => {
        console.log(data);
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
        <Select<keyof typeof apoForceFields>
          error={errors.forceField}
          label={t("forms:force-field.title")}
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder={t("forms:force-field.placeholder")}
          selectedValue={watch("forceField")}
          values={apoForceFields}
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
