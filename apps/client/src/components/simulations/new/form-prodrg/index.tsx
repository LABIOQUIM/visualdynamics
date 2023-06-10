import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { CloudCog, Download } from "lucide-react";
import { useRouter } from "next/router";
import Trans from "next-translate/Trans";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/general/buttons";
import { Input } from "@app/components/general/forms/input";
import { Select } from "@app/components/general/forms/select";
import { Switch } from "@app/components/general/forms/switch";
import {
  PRODRGFormSchema,
  PRODRGFormSchemaType
} from "@app/components/simulations/new/form-prodrg/schema.zod";
import { api } from "@app/lib/api";
import { boxTypes } from "@app/utils/box-types";
import { prodrgForceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export function FormPRODRG({ user }: PropsWithUser) {
  const {
    formState: { errors, isSubmitting },
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
  const { t } = useTranslation();

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
      .post("/generate/prodrg", formData, {
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
                folder: data.folder,
                email: user.email
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
      });
  };

  return (
    <form
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <Input
        label={t("simulations-form:file-pdb.title")}
        type="file"
        accept=".pdb"
        error={errors.protein}
        disabled={isSubmitting}
        {...register("protein")}
      />

      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <Input
          label={t("simulations-form:file-itp.title")}
          type="file"
          accept=".itp,.gro"
          error={errors.ligandItp}
          disabled={isSubmitting}
          {...register("ligandItp")}
        />

        <Input
          label={t("simulations-form:file-gro.title")}
          type="file"
          accept=".pdb,.gro"
          error={errors.ligandGro}
          disabled={isSubmitting}
          {...register("ligandGro")}
        />
      </div>

      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <Select<keyof typeof prodrgForceFields>
          error={errors.forceField}
          label={t("simulations-form:force-field.title")}
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder={t("simulations-form:force-field.placeholder")}
          selectedValue={watch("forceField")}
          disabled={isSubmitting}
          values={prodrgForceFields}
        />

        <Select<keyof typeof waterModels>
          error={errors.waterModel}
          label={t("simulations-form:water-model.title")}
          name="waterModel"
          onChange={(newWaterModel) => setValue("waterModel", newWaterModel)}
          placeholder={t("simulations-form:water-model.placeholder")}
          selectedValue={watch("waterModel")}
          disabled={isSubmitting}
          values={waterModels}
        />
      </div>

      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <Select<keyof typeof boxTypes>
          error={errors.boxType}
          label={t("simulations-form:box-type.title")}
          name="boxType"
          onChange={(newBoxType) => setValue("boxType", newBoxType)}
          placeholder={t("simulations-form:box-type.placeholder")}
          selectedValue={watch("boxType")}
          disabled={isSubmitting}
          values={boxTypes}
        />

        <Input
          label={t("simulations-form:box-distance.title")}
          error={errors.boxDistance}
          type="number"
          disabled={isSubmitting}
          {...register("boxDistance")}
        />
      </div>

      <label>{t("simulations-form:options")}</label>
      <div className="flex flex-col gap-y-2">
        <Switch
          label={t("simulations-form:neutralize.title")}
          checked={watch("neutralize")}
          onCheckedChange={(bool) => setValue("neutralize", bool)}
          name="neutralize"
          disabled
        />

        <Switch
          label={t("simulations-form:ignore.title")}
          checked={watch("ignore")}
          onCheckedChange={(bool) => setValue("ignore", bool)}
          name="ignore"
          disabled
        />

        <Switch
          label={t("simulations-form:double.title")}
          checked={watch("double")}
          onCheckedChange={(bool) => setValue("double", bool)}
          name="double"
          disabled
        />

        <Switch
          label={t("simulations-form:run.title")}
          disabled={isSubmitting}
          checked={watch("bootstrap")}
          onCheckedChange={(bool) => setValue("bootstrap", bool)}
          name="bootstrap"
        />
      </div>
      <Button
        disabled={isSubmitting}
        type="submit"
      >
        <AnimatePresence mode="wait">
          {watch("bootstrap") === true ? (
            <LazyMotion
              features={() =>
                import("@app/utils/load-motion-features").then(
                  (res) => res.default
                )
              }
            >
              <m.p
                className="flex gap-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="submit.run"
              >
                <CloudCog />
                <Trans i18nKey="simulations-form:submit.run" />
              </m.p>
            </LazyMotion>
          ) : (
            <LazyMotion
              features={() =>
                import("@app/utils/load-motion-features").then(
                  (res) => res.default
                )
              }
            >
              <m.p
                className="flex gap-x-2"
                key="submit.download"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Download />
                <Trans
                  key="submit.dload"
                  i18nKey="simulations-form:submit.download"
                />
              </m.p>
            </LazyMotion>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}
