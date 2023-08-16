import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { CloudCog, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Trans from "next-translate/Trans";
import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "aold/components/general/alert-box";
import { Button } from "aold/components/general/buttons";
import { Input } from "aold/components/general/forms/input";
import { Select } from "aold/components/general/forms/select";
import { Switch } from "aold/components/general/forms/switch";
import {
  APOFormSchema,
  APOFormSchemaType
} from "aold/components/simulations/new/form-apo/schema.zod";
import { useSettings } from "aold/context/SettingsContext";
import { api } from "../../../../lib/api";
import { boxTypes } from "../../../../utils/box-types";
import { apoForceFields } from "../../../../utils/force-fields";
import { waterModels } from "../../../../utils/water-models";

export function FormAPO({ user }: PropsWithUser) {
  const { t } = useTranslation();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<APOFormSchemaType>({
    resolver: zodResolver(APOFormSchema),
    defaultValues: {
      neutralize: true,
      ignore: true,
      double: false,
      bootstrap: false
    }
  });
  const { maintenanceMode } = useSettings();
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
            .then(() => router.push("/simulations/running"))
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

      <div className="grid grid-flow-row grid-cols-1 gap-3 md:grid-cols-2">
        <Select<keyof typeof apoForceFields>
          error={errors.forceField}
          label={t("simulations-form:force-field.title")}
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder={t("simulations-form:force-field.placeholder")}
          selectedValue={watch("forceField")}
          disabled={isSubmitting}
          values={apoForceFields}
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
        <Input
          label={t("simulations-form:ns.title")}
          disabled
          value="5ns"
        />
        <AlertBox>
          <Trans
            i18nKey="simulations-form:ns.info"
            components={{
              email: (
                <Link
                  className="text-primary-950 dark:text-primary-100"
                  href="mailto:fernando.zanchi@fiocruz.br"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )
            }}
          />
        </AlertBox>
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
        disabled={isSubmitting || maintenanceMode}
        type="submit"
      >
        <AnimatePresence mode="wait">
          {watch("bootstrap") === true ? (
            <LazyMotion
              features={() =>
                import("../../../../utils/load-motion-features").then(
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
                import("../../../../utils/load-motion-features").then(
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
