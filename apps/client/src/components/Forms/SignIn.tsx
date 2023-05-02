import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Lock, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { TextButton } from "@app/components/Button/Text";
import { Input } from "@app/components/Input";
import { Spinner } from "@app/components/Spinner";
import {
  SignInFormSchema,
  SignInFormSchemaType
} from "@app/schemas/components/auth/signin.zod";

export function SignInForm() {
  const { t } = useTranslation(["signin"]);
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
    signIn("credentials", {
      identifier,
      password,
      redirect: false
    }).then((data) => {
      if (data) {
        if (data.error) {
          setSignInError(data.error);
        }

        if (data.ok) {
          reset();
          router.push("/my-dynamics");
        }
      }
    });
  };

  return (
    <form
      className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleAuth)}
    >
      {signInError ? (
        <div className="flex gap-x-2 rounded-lg border border-orange-500 bg-orange-400/20 p-2">
          <AlertTriangle className="stroke-orange-600 dark:stroke-orange-200" />
          <p className="text-orange-600 dark:text-orange-200">
            {t(`signin:errors.${signInError}`)}
          </p>
        </div>
      ) : null}
      <Input
        error={errors.identifier}
        disabled={isSubmitting}
        label={t("signin:identifier.title")}
        placeholder={t("signin:identifier.placeholder")}
        {...register("identifier")}
      />
      <Input
        error={errors.password}
        disabled={isSubmitting}
        label={t("signin:password.title")}
        placeholder={t("signin:password.placeholder")}
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isSubmitting}
        LeftIcon={!isSubmitting ? LogIn : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("signin:title")}
      </Button>
      <div className="flex gap-x-2">
        <TextButton
          className="text-sm"
          iconClassName="h-4 w-4"
          LeftIcon={Lock}
          type="button"
        >
          {t("signin:lost-password")}
        </TextButton>
        <TextButton
          className="text-sm"
          iconClassName="h-4 w-4"
          LeftIcon={UserPlus}
          onClick={() => router.push("/signup")}
          type="button"
        >
          {t("signin:new-user")}
        </TextButton>
      </div>
    </form>
  );
}
