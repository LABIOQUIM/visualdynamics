"use client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Forms/Input";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { useI18n } from "@/locales/client";

import { ResetPasswordFormSchema, ResetPasswordFormSchemaType } from "./schema";

type Props = {
  resetId: string;
  resetUserPassword: (resetId: string, newPassword: string) => any;
};

export function ResetPasswordForm({ resetId, resetUserPassword }: Props) {
  const t = useI18n();
  const [status, setStatus] = useState("");
  const router = useRouter();
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
    setStatus("");
    const response = await resetUserPassword(resetId, password);

    if (response === "reset") {
      reset();
      router.push("/login?from=reset");
    } else {
      setStatus("errored");
    }
  };

  return (
    <form
      className="mt-10 flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleReset)}
    >
      {status === "errored" ? (
        <Alert status="danger">{t(`reset.reset-form.errors.failed`)}</Alert>
      ) : null}
      <Input
        error={errors.password}
        disabled={isSubmitting}
        label={t("reset.reset-form.password.title")}
        placeholder="********"
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isSubmitting}
        LeftIcon={!isSubmitting ? Key : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("reset.reset-form.title")}
      </Button>
    </form>
  );
}
