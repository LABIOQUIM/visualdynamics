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
  APOFormSchema,
  APOFormSchemaType
} from "@app/schemas/pages/dynamic/apo.zod";
import { boxTypes } from "@app/utils/box-types";
import { forceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export default function APODynamic() {
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
  const { t } = useTranslation(["features"]);

  const handleSubmitDynamic: SubmitHandler<APOFormSchemaType> = async (
    data
  ) => {
    const formData = new FormData();

    formData.append("file_pdb", data.protein[0]);
    formData.append("force_field", data.forceField);
    formData.append("water_model", data.waterModel);
    formData.append("box_type", data.boxType);
    formData.append("box_distance", data.boxDistance);
    formData.append("bootstrap", data.bootstrap ? "True" : "False");
    formData.append("neutralize", data.neutralize ? "True" : "False");
    formData.append("double", data.double ? "True" : "False");
    formData.append("ignore", data.ignore ? "True" : "False");
    formData.append("username", "IvoVieira1");

    await api
      .post("/apo", formData, {
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
        }
      })
      .catch(() => alert("Não foi"));
  };

  return (
    <PageLayout title={t("features:dynamic.types.apo")}>
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

        <Select<keyof typeof forceFields>
          error={errors.forceField}
          label={t("features:dynamic.forms.force-field.title")}
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder={t("features:dynamic.forms.force-field.placeholder")}
          selectedValue={watch("forceField")}
          values={forceFields}
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
          className="mt-4"
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
