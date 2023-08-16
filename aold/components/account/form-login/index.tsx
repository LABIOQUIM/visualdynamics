import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

import {
  SignInFormSchema,
  SignInFormSchemaType
} from "aold/components/account/form-login/schema.zod";
import { AlertBox } from "aold/components/general/alert-box";
import { Button } from "aold/components/general/buttons";
import { TextButton } from "aold/components/general/buttons/Text";
import { Input } from "aold/components/general/forms/input";
import { Spinner } from "aold/components/general/loading-indicator/spinner";

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
    })
      .then((data) => {
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
      })
      .catch(console.log);
  };

  return (
    <>
      <form
        className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
        onSubmit={handleSubmit(handleAuth)}
      >
        {signInError ? (
          <AlertBox status="warning">
            {t(`account-login:errors.${signInError}`)}
          </AlertBox>
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
