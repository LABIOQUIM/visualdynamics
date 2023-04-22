import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudCog, Download } from "lucide-react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { Select } from "@app/components/Select";
import { SEO } from "@app/components/SEO";
import { Switch } from "@app/components/Switch";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { api } from "@app/lib/api";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";
import {
  APOFormSchema,
  APOFormSchemaType
} from "@app/schemas/pages/dynamic/apo.zod";
import { boxTypes } from "@app/utils/box-types";
import { apoForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

import { authOptions } from "../api/auth/[...nextauth]";

export const getServerSideProps = withSSRTranslations(
  withSSRAuth(async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (session) {
      const data = await getRunningDynamic(session.user.username);

      if (data?.status === "running") {
        return {
          redirect: {
            destination: "/dynamic/running",
            permanent: false
          }
        };
      }
    }

    return {
      props: {}
    };
  }),
  {
    namespaces: ["forms"]
  }
);

export default function APODynamic({ user }: { user: User }) {
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
  const { t } = useTranslation(["forms", "navigation"]);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

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
      .post("/apo", formData, {
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
    <>
      <SEO title={t("navigation:dynamic.models.apo")} />
      <h2 className="text-center text-2xl -mb-2.5 text-primary-600 dark:text-primary-400">
        {t("navigation:dynamic.models.apo")}
      </h2>
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
    </>
  );
}
