import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

import {
  SignInFormSchema,
  SignInFormSchemaType
} from "@app/components/account/form-login/schema.zod";
import { Button } from "@app/components/general/buttons";
import { TextButton } from "@app/components/general/buttons/Text";
import { Input } from "@app/components/general/forms/input";
import { Spinner } from "@app/components/general/loading-indicator/spinner";

export function FormLogin() {
  const { t } = useTranslation();
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

  const handleAuth: SubmitHandler<SignInFormSchemaType> = async ({
    identifier,
    password
  }) => {
    setSignInError("");
    await signIn("credentials", {
      identifier,
      password,
      redirect: false
    }).then((data) => {
      if (data) {
        if (data.error) {
          if (data.error === "user.no-pass") {
            router.push(`/account/recover?reason=password-migration`);
          } else {
            setSignInError(data.error);
          }
        }

        if (data.ok) {
          reset();
          router.push("/simulations");
        }
      }
    });
  };

  return (
    <>
      <form
        className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
        onSubmit={handleSubmit(handleAuth)}
      >
        {signInError ? (
          <div className="flex gap-x-2 rounded-lg border border-orange-500 bg-orange-400/20 p-2">
            <AlertTriangle className="stroke-orange-600 dark:stroke-orange-200" />
            <p className="text-orange-600 dark:text-orange-200">
              {t(`account-login:errors.${signInError}`)}
            </p>
          </div>
        ) : null}
        <Input
          error={errors.identifier}
          disabled={isSubmitting}
          label={t("account-login:identifier.title")}
          placeholder={t("account-login:identifier.placeholder")}
          {...register("identifier")}
        />
        <Input
          error={errors.password}
          disabled={isSubmitting}
          label={t("account-login:password.title")}
          placeholder={t("account-login:password.placeholder")}
          type="password"
          {...register("password")}
        />
        <Button
          disabled={isSubmitting}
          LeftIcon={!isSubmitting ? LogIn : undefined}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : null}
          {t("account-login:title")}
        </Button>
        <div className="flex gap-x-2">
          <Link href="/account/recover">
            <TextButton
              className="text-sm"
              iconClassName="h-4 w-4"
              LeftIcon={Lock}
              type="button"
            >
              {t("account-login:lost-password")}
            </TextButton>
          </Link>
          <Link href="/account/register">
            <TextButton
              className="text-sm"
              iconClassName="h-4 w-4"
              LeftIcon={UserPlus}
              type="button"
            >
              {t("account-login:new-user")}
            </TextButton>
          </Link>
        </div>
      </form>
    </>
  );
}
