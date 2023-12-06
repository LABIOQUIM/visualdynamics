"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { ArrowLeft, CloudCog, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Forms/Input";
import { Select } from "@/components/Forms/Select";
import { Switch } from "@/components/Forms/Switch";
import { H2 } from "@/components/Typography";
import { useSettings } from "@/contexts/settings";
import { useI18n } from "@/locales/client";
import { boxTypes } from "@/utils/boxTypes";
import { prodrgForceFields } from "@/utils/forceFields";
import { waterModels } from "@/utils/waterModels";

import { PRODRGFormSchema, PRODRGFormSchemaType } from "./schema";

type Props = {
  createNewPRODRGSimulation(
    data: NewPRODRGSimulationProps,
    formDataWithFile: FormData
  ): Promise<any>;
};

export function PRODRGForm({ createNewPRODRGSimulation }: Props) {
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
  const { maintenanceMode } = useSettings();
  const router = useRouter();
  const t = useI18n();
  const { data: session } = useSession();

  const handleSubmitDynamic: SubmitHandler<PRODRGFormSchemaType> = async (
    data
  ) => {
    const formData = new FormData();

    formData.append("file_pdb", data.protein[0]);
    formData.append("file_itp", data.ligandItp[0]);
    formData.append("file_gro", data.ligandGro[0]);

    // @ts-ignore
    delete data.protein;
    // @ts-ignore
    delete data.ligandItp;
    // @ts-ignore
    delete data.ligandGro;

    const response = await createNewPRODRGSimulation(
      {
        ...data,
        username: session?.user.username ?? "stub",
        user_email: session?.user?.email ?? "visualdynamics@fiocruz.br"
      },
      formData
    );

    if (response === "simulation-started") {
      router.push("/running-simulation");
    } else {
      const link = document.createElement("a");
      link.download = "dynamic-commands.txt";
      link.href =
        "data:text/plain;charset=utf-8," + encodeURIComponent(response);
      link.click();
    }
  };

  return (
    <form
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit(handleSubmitDynamic)}
    >
      <div className="flex gap-2">
        <Link href="/new-simulation">
          <ArrowLeft />
        </Link>
        <H2>{t("navigation.simulations.models.prodrg")}</H2>
      </div>
      <Input
        label={t("new-simulation.form.file-pdb.title")}
        type="file"
        accept=".pdb"
        error={errors.protein}
        disabled={isSubmitting}
        {...register("protein")}
      />

      <div className="grid grid-flow-row grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label={t("new-simulation.form.file-itp.title")}
          type="file"
          accept=".itp"
          error={errors.ligandItp}
          disabled={isSubmitting}
          {...register("ligandItp")}
        />

        <Input
          label={t("new-simulation.form.file-gro.title")}
          type="file"
          accept=".pdb"
          error={errors.ligandGro}
          disabled={isSubmitting}
          {...register("ligandGro")}
        />

        <Select<keyof typeof prodrgForceFields>
          error={errors.forceField}
          label={t("new-simulation.form.force-field.title")}
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder={t("new-simulation.form.force-field.placeholder")}
          selectedValue={watch("forceField")}
          disabled={isSubmitting}
          values={prodrgForceFields}
        />

        <Select<keyof typeof waterModels>
          error={errors.waterModel}
          label={t("new-simulation.form.water-model.title")}
          name="waterModel"
          onChange={(newWaterModel) => setValue("waterModel", newWaterModel)}
          placeholder={t("new-simulation.form.water-model.placeholder")}
          selectedValue={watch("waterModel")}
          disabled={isSubmitting}
          values={waterModels}
        />

        <Select<keyof typeof boxTypes>
          error={errors.boxType}
          label={t("new-simulation.form.box-type.title")}
          name="boxType"
          onChange={(newBoxType) => setValue("boxType", newBoxType)}
          placeholder={t("new-simulation.form.box-type.placeholder")}
          selectedValue={watch("boxType")}
          disabled={isSubmitting}
          values={boxTypes}
        />

        <Input
          label={t("new-simulation.form.box-distance.title")}
          error={errors.boxDistance}
          type="number"
          disabled={isSubmitting}
          {...register("boxDistance")}
        />

        <Input
          label={t("new-simulation.form.ns.title")}
          disabled
          value="5ns"
        />

        <Alert>{t("new-simulation.form.ns.info")}</Alert>
      </div>

      <label>{t("new-simulation.form.options")}</label>
      <div className="flex flex-col gap-y-2">
        <Switch
          label={t("new-simulation.form.neutralize.title")}
          checked={watch("neutralize")}
          onCheckedChange={(bool) => setValue("neutralize", bool)}
          name="neutralize"
          disabled
        />

        <Switch
          label={t("new-simulation.form.ignore.title")}
          checked={watch("ignore")}
          onCheckedChange={(bool) => setValue("ignore", bool)}
          name="ignore"
          disabled
        />

        <Switch
          label={t("new-simulation.form.double.title")}
          checked={watch("double")}
          onCheckedChange={(bool) => setValue("double", bool)}
          name="double"
          disabled
        />

        <Switch
          label={t("new-simulation.form.run.title")}
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
                import("@/utils/loadMotionFeatures").then((res) => res.default)
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
                {t("new-simulation.form.submit.run")}
              </m.p>
            </LazyMotion>
          ) : (
            <LazyMotion
              features={() =>
                import("@/utils/loadMotionFeatures").then((res) => res.default)
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
                {t("new-simulation.form.submit.download")}
              </m.p>
            </LazyMotion>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}
