import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Mail, MailCheck } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import {
  ResetPasswordRequestFormSchema,
  ResetPasswordRequestFormSchemaType
} from "@app/components/account/form-recover/request/schema.zod";
import { AlertBox } from "@app/components/general/alert-box";
import { Button } from "@app/components/general/buttons";
import { Input } from "@app/components/general/forms/input";
import { Spinner } from "@app/components/general/loading-indicator/spinner";

export function ResetPasswordRequestForm() {
  const { t } = useTranslation();
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
          {t("account-recover:request-form.success")}
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
        <AlertBox status="warning">
          {t(`account-recover:request-form.errors.no-user`)}
        </AlertBox>
      ) : null}
      <Input
        error={errors.identifier}
        disabled={isSubmitting}
        label={t("account-recover:request-form.identifier.title")}
        placeholder={t("account-recover:request-form.identifier.placeholder")}
        {...register("identifier")}
      />
      <Button
        disabled={isSubmitting}
        LeftIcon={!isSubmitting ? Mail : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("account-recover:request-form.title")}
      </Button>
    </form>
  );
}
