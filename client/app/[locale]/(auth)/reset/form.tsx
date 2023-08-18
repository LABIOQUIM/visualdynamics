"use client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Forms/Input";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { useI18n } from "@/locales/client";

import {
  ResetPasswordRequestFormSchema,
  ResetPasswordRequestFormSchemaType
} from "./schema";

type Props = {
  createUserPasswordReset: (identifier: string) => any;
};

export function ResetPasswordRequestForm({ createUserPasswordReset }: Props) {
  const t = useI18n();
  const [status, setStatus] = useState("");
  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<ResetPasswordRequestFormSchemaType>({
    resolver: zodResolver(ResetPasswordRequestFormSchema)
  });

  const handle: SubmitHandler<ResetPasswordRequestFormSchemaType> = async ({
    identifier
  }) => {
    setStatus("");
    const response = await createUserPasswordReset(identifier);

    if (response === "mailed") {
      reset();
      setStatus("mailed");
    } else if (response === "user.not-found") {
      setStatus("user-not-found");
    }
  };

  if (status === "mailed") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <MailCheck className="h-28 w-28 stroke-primary-600" />
        <h2 className="text-xl font-medium">
          {t("reset.request-form.success")}
        </h2>
      </div>
    );
  }

  return (
    <form
      className="mt-10 flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handle)}
    >
      {status === "user.not-found" ? (
        <Alert status="warning">{t(`reset.request-form.errors.no-user`)}</Alert>
      ) : status === "sendmail-failed" ? (
        <Alert status="warning">
          {t(`reset.request-form.errors.sendmail-failed`)}
        </Alert>
      ) : null}
      <Input
        error={errors.identifier}
        disabled={isSubmitting}
        label={t("reset.request-form.identifier.title")}
        placeholder={t("reset.request-form.identifier.placeholder")}
        {...register("identifier")}
      />
      <Button
        disabled={isSubmitting}
        LeftIcon={!isSubmitting ? Mail : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("reset.request-form.title")}
      </Button>
    </form>
  );
}
