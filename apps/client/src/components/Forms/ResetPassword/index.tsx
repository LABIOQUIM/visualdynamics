import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AlertTriangle, Key, UserCheck } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { Spinner } from "@app/components/Spinner";
import {
  ResetPasswordFormSchema,
  ResetPasswordFormSchemaType
} from "@app/schemas/pages/reset-password/reset.zod";

interface ResetPasswordFormProps {
  resetId: string;
}

export function ResetPasswordForm({ resetId }: ResetPasswordFormProps) {
  const { t } = useTranslation(["reset-password"]);
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
        <div className="flex gap-x-2 rounded-lg border border-orange-500 bg-orange-400/20 p-2">
          <AlertTriangle className="min-h-[1.75rem] min-w-[1.75rem] stroke-orange-600 dark:stroke-orange-200" />
          <p className="text-orange-600 dark:text-orange-200">
            {t(`reset-password:reset-form.errors.failed`)}
          </p>
        </div>
      ) : null}
      {isReseted ? (
        <div className="flex gap-x-2 rounded-lg border border-primary-500 bg-primary-400/20 p-2">
          <UserCheck className="min-h-[1.75rem] min-w-[1.75rem] stroke-primary-600 dark:stroke-primary-200" />
          <p className="text-primary-600 dark:text-primary-200">
            {t(`reset-password:reset-form.reseted`)}
          </p>
        </div>
      ) : null}
      <Input
        error={errors.password}
        disabled={isSubmitting || isReseted}
        label={t("reset-password:reset-form.password.title")}
        placeholder={t("reset-password:reset-form.password.placeholder")}
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isSubmitting || isReseted}
        LeftIcon={!isSubmitting ? Key : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("reset-password:reset-form.title")}
      </Button>
    </form>
  );
}
