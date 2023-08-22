"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudCog, Cog } from "lucide-react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Input } from "@/components/Forms/Input";
import { useI18n } from "@/locales/client";

import { TriggerRunFormSchema, TriggerRunFormSchemaType } from "./schema";

type Props = {
  triggerRun: (folder: string, email: string) => Promise<any>;
};

export function TriggerRun({ triggerRun }: Props) {
  const t = useI18n();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<TriggerRunFormSchemaType>({
    resolver: zodResolver(TriggerRunFormSchema)
  });

  const handleTriggerRun: SubmitHandler<TriggerRunFormSchemaType> = async ({
    email,
    folder
  }) => {
    triggerRun(folder, email)
      .then(() => {
        toast(t("admin.simulations.trigger-run.success") as string, {
          type: "success"
        });
        reset();
      })
      .catch(() =>
        toast(t("admin.simulations.trigger-run.failed") as string, {
          type: "error"
        })
      );
  };

  return (
    <Dialog
      title={t("admin.simulations.trigger-run.title")}
      description={t("admin.simulations.trigger-run.description")}
      Trigger={(props) => (
        <Button
          title={t("admin.simulations.trigger-run.title")}
          iconClassName="h-5 w-5"
          LeftIcon={Cog}
          {...props}
        >
          {t("admin.simulations.trigger-run.title")}
        </Button>
      )}
      Submit={() => (
        <Button
          disabled={isSubmitting}
          LeftIcon={CloudCog}
          onClick={handleSubmit(handleTriggerRun)}
        >
          {t("admin.simulations.trigger-run.title")}
        </Button>
      )}
    >
      <div className="m-2 w-full space-y-4">
        <Input
          error={errors.folder}
          label={t("admin.simulations.trigger-run.form.folder.label")}
          disabled={isSubmitting}
          placeholder="/home/user/VDfiles/admin/APO/2mu8/2023-06-19T07:09:00"
          {...register("folder")}
        />
        <Input
          error={errors.email}
          label={t("admin.simulations.trigger-run.form.email.label")}
          disabled={isSubmitting}
          placeholder="user@uni.edu"
          {...register("email")}
        />
      </div>
    </Dialog>
  );
}
