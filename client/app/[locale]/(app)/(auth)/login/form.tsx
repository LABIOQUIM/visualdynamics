"use client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/Button";
import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Alert } from "@/components/Alert";
import { Input } from "@/components/Forms/Input";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { useI18n } from "@/locales/client";

import { SignInFormSchema, SignInFormSchemaType } from "./schema";

export function FormLogin() {
  const t = useI18n();
  const [signInError, setSignInError] = useState("");
  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<SignInFormSchemaType>({
    resolver: zodResolver(SignInFormSchema)
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAuth: SubmitHandler<SignInFormSchemaType> = async ({
    identifier,
    password
  }) => {
    setSignInError("");
    const response = await signIn("credentials", {
      identifier,
      password,
      redirect: false
    });

    if (response && response.error) {
      if (response.error === "user.no-pass") {
        router.push(`/reset?reason=password-migration`);
      }
      setSignInError(response.error);
    }

    if (response && response.ok) {
      reset();
      const callbackUrl = searchParams.get("callbackUrl");

      router.push(callbackUrl ?? "/simulations");
    }
  };

  return (
    <>
      <form
        className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
        onSubmit={handleSubmit(handleAuth)}
      >
        {signInError ? ( // @ts-ignore
          <Alert status="warning">{t(`login.errors.${signInError}`)}</Alert>
        ) : null}
        <Input
          error={errors.identifier}
          disabled={isSubmitting}
          label={t("login.identifier.title")}
          placeholder={t("login.identifier.placeholder")}
          {...register("identifier")}
        />
        <Input
          error={errors.password}
          disabled={isSubmitting}
          label={t("login.password.title")}
          placeholder="********"
          type="password"
          {...register("password")}
        />
        <Button
          disabled={isSubmitting}
          LeftIcon={!isSubmitting ? LogIn : undefined}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : null}
          {t("login.title")}
        </Button>
        <div className="flex gap-x-2">
          <Link href="/reset">
            <Button
              className="text-sm"
              iconClassName="h-4 w-4"
              isOutline
              noBorder
              LeftIcon={Lock}
              type="button"
            >
              {t("login.lost-password")}
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className="text-sm"
              iconClassName="h-4 w-4"
              isOutline
              noBorder
              LeftIcon={UserPlus}
              type="button"
            >
              {t("login.new-user")}
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
