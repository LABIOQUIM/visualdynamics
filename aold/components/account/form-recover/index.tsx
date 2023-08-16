import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Key } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import {
  ResetPasswordFormSchema,
  ResetPasswordFormSchemaType
} from "aold/components/account/form-recover/schema.zod";
import { AlertBox } from "aold/components/general/alert-box";
import { Button } from "aold/components/general/buttons";
import { Input } from "aold/components/general/forms/input";
import { Spinner } from "aold/components/general/loading-indicator/spinner";

interface ResetPasswordFormProps {
  resetId: string;
}

export function ResetPasswordForm({ resetId }: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const [errored, setErrored] = useState(false);
  const [isReseted, setIsReseted] = useState(false);
  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<ResetPasswordFormSchemaType>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      resetId
    }
  });

  const handleReset: SubmitHandler<ResetPasswordFormSchemaType> = async ({
    password,
    resetId
  }) => {
    setErrored(false);
    await axios
      .put("/api/users/password/reset", {
        resetId,
        password
      })
      .then(() => {
        reset();
        setIsReseted(true);
      })
      .catch(() => setErrored(true));
  };

  return (
    <form
      className="mt-10 flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleReset)}
    >
      {errored ? (
        <AlertBox status="danger">
          {t(`account-recover:reset-form.errors.failed`)}
        </AlertBox>
      ) : null}
      {isReseted ? (
        <AlertBox status="success">
          {t(`account-recover:reset-form.reseted`)}
        </AlertBox>
      ) : null}
      <Input
        error={errors.password}
        disabled={isSubmitting || isReseted}
        label={t("account-recover:reset-form.password.title")}
        placeholder="********"
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isSubmitting || isReseted}
        LeftIcon={!isSubmitting ? Key : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("account-recover:reset-form.title")}
      </Button>
    </form>
  );
}
