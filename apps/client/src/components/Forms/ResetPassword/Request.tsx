import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AlertTriangle, MailCheck } from "lucide-react";
import { Mail } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { Spinner } from "@app/components/Spinner";
import {
  ResetPasswordRequestFormSchema,
  ResetPasswordRequestFormSchemaType
} from "@app/schemas/pages/reset-password/request.zod";

export function ResetPasswordRequestForm() {
  const { t } = useTranslation(["reset-password"]);
  const [errored, setErrored] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<ResetPasswordRequestFormSchemaType>({
    resolver: zodResolver(ResetPasswordRequestFormSchema)
  });

  const handleReuest: SubmitHandler<
    ResetPasswordRequestFormSchemaType
  > = async ({ identifier }) => {
    setErrored(false);
    await axios
      .post("/api/users/password/reset", {
        identifier
      })
      .then(() => {
        reset();
        setMailSent(true);
      })
      .catch(() => setErrored(true));
  };

  if (mailSent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <MailCheck className="h-28 w-28 stroke-primary-600" />
        <h2 className="text-xl font-medium">
          {t("reset-password:request-form.success")}
        </h2>
      </div>
    );
  }

  return (
    <form
      className="mt-10 flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleReuest)}
    >
      {errored ? (
        <div className="flex gap-x-2 rounded-lg border border-orange-500 bg-orange-400/20 p-2">
          <AlertTriangle className="stroke-orange-600 dark:stroke-orange-200" />
          <p className="text-orange-600 dark:text-orange-200">
            {t(`reset-password:request-form.errors.no-user`)}
          </p>
        </div>
      ) : null}
      <Input
        error={errors.identifier}
        disabled={isSubmitting}
        label={t("reset-password:request-form.identifier.title")}
        placeholder={t("reset-password:request-form.identifier.placeholder")}
        {...register("identifier")}
      />
      <Button
        disabled={isSubmitting}
        LeftIcon={!isSubmitting ? Mail : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("reset-password:request-form.title")}
      </Button>
    </form>
  );
}
