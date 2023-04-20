import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudCog, Download } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
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

import { authOptions } from "../api/auth/[...nextauth]";

export const config = {
  runtime: "nodejs"
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale
}) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    const data = await getRunningDynamic(session.user.username);

    if (data?.status === "running") {
      return {
        redirect: {
          destination: "/dynamic/running"
        },
        props: {}
      };
    }
  } else {
    return {
      redirect: {
        destination: "/"
      },
      props: {}
    };
  }

  return {
    props: {
      session,
      user: session.user,
      ...(await serverSideTranslations(locale ?? "en-US", [
        "common",
        "forms",
        "navigation"
      ]))
    }
  };
};

export default function ACPYPEDynamic({ user }: { user: User }) {
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
  const { t } = useTranslation(["forms", "navigation"]);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

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
    formData.append("username", user.username);

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
    <PageLayout title={t("navigation:dynamic.models.acpype")}>
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

        <div className="flex flex-col md:flex-row gap-1">
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

        <div className="flex flex-col md:flex-row gap-1">
          <Select<keyof typeof acpypeForceFields>
            error={errors.forceField}
            label={t("forms:force-field.title")}
            name="forceField"
            onChange={(newForceField) => setValue("forceField", newForceField)}
            placeholder={t("forms:force-field.placeholder")}
            selectedValue={watch("forceField")}
            values={acpypeForceFields}
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

        <div className="flex flex-col md:flex-row gap-1">
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
    </PageLayout>
  );
}
