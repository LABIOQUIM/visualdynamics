import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudCog, Download } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { PageLayout } from "@app/components/Layout/Page";
import { Select } from "@app/components/Select";
import { Switch } from "@app/components/Switch";
import { api } from "@app/lib/api";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";
import {
  ACPYPEFormSchema,
  ACPYPEFormSchemaType
} from "@app/schemas/pages/dynamic/acpype.zod";
import { boxTypes } from "@app/utils/box-types";
import { acpypeForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export default function ACPYPEDynamic() {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<ACPYPEFormSchemaType>({
    resolver: zodResolver(ACPYPEFormSchema),
    defaultValues: {
      neutralize: true,
      ignore: true,
      double: false
    }
  });
  const router = useRouter();
  const { t } = useTranslation(["features"]);

  const handleSubmitDynamic: SubmitHandler<ACPYPEFormSchemaType> = async (
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
    formData.append("username", "IvoVieira1");

    await api
      .post("/acpype", formData, {
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
    <PageLayout title={t("features:dynamic.types.acpype")}>
      <form
        className="flex flex-col gap-y-2"
        onSubmit={handleSubmit(handleSubmitDynamic)}
      >
        <Input
          label={t("features:dynamic.forms.file-pdb.title")}
          type="file"
          accept=".pdb"
          error={errors.protein}
          {...register("protein")}
        />

        <div className="flex flex-col md:flex-row gap-1">
          <Input
            label={t("features:dynamic.forms.file-itp.title")}
            type="file"
            accept=".itp,.gro"
            error={errors.ligandItp}
            {...register("ligandItp")}
          />

          <Input
            label={t("features:dynamic.forms.file-gro.title")}
            type="file"
            accept=".pdb,.gro"
            error={errors.ligandGro}
            {...register("ligandGro")}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-1">
          <Select<keyof typeof acpypeForceFields>
            error={errors.forceField}
            label={t("features:dynamic.forms.force-field.title")}
            name="forceField"
            onChange={(newForceField) => setValue("forceField", newForceField)}
            placeholder={t("features:dynamic.forms.force-field.placeholder")}
            selectedValue={watch("forceField")}
            values={acpypeForceFields}
          />

          <Select<keyof typeof waterModels>
            error={errors.waterModel}
            label={t("features:dynamic.forms.water-model.title")}
            name="waterModel"
            onChange={(newWaterModel) => setValue("waterModel", newWaterModel)}
            placeholder={t("features:dynamic.forms.water-model.placeholder")}
            selectedValue={watch("waterModel")}
            values={waterModels}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-1">
          <Select<keyof typeof boxTypes>
            error={errors.boxType}
            label={t("features:dynamic.forms.box-type.title")}
            name="boxType"
            onChange={(newBoxType) => setValue("boxType", newBoxType)}
            placeholder={t("features:dynamic.forms.box-type.placeholder")}
            selectedValue={watch("boxType")}
            values={boxTypes}
          />

          <Input
            label={t("features:dynamic.forms.box-distance.title")}
            error={errors.boxDistance}
            type="number"
            {...register("boxDistance")}
          />
        </div>

        <label>{t("features:dynamic.options")}</label>
        <div className="flex flex-col gap-y-2">
          <Switch
            label={t("features:dynamic.forms.neutralize.title")}
            checked={watch("neutralize")}
            onCheckedChange={(bool) => setValue("neutralize", bool)}
            name="neutralize"
            disabled
          />

          <Switch
            label={t("features:dynamic.forms.ignore.title")}
            checked={watch("ignore")}
            onCheckedChange={(bool) => setValue("ignore", bool)}
            name="ignore"
            disabled
          />

          <Switch
            label={t("features:dynamic.forms.double.title")}
            checked={watch("double")}
            onCheckedChange={(bool) => setValue("double", bool)}
            name="double"
            disabled
          />

          <Switch
            label={t("features:dynamic.forms.run.title")}
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
            ? t("features:dynamic.forms.submit.run")
            : t("features:dynamic.forms.submit.download")}
        </Button>
      </form>
    </PageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const data = await getRunningDynamic("IvoVieira1");

  if (data?.status === "running") {
    return {
      redirect: {
        destination: "/dynamic/running"
      },
      props: {}
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["features"]))
    }
  };
};
