import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
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
  const { status } = useSession();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit
  } = useForm<SignInFormSchemaType>({
    resolver: zodResolver(SignInFormSchema)
  });
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/my-dynamics");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleAuth: SubmitHandler<SignInFormSchemaType> = async ({
    identifier,
    password
  }) => {
    setIsAuthenticating(true);
    signIn("credentials", {
      identifier,
      password,
      redirect: false
    })
      .then(() => reset())
      .finally(() => setIsAuthenticating(false));
  };

  return (
    <form
      className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleAuth)}
    >
      <Input
        error={errors.identifier}
        label={t("signin:identifier.title")}
        placeholder={t("signin:identifier.placeholder")}
        {...register("identifier")}
      />
      <Input
        error={errors.password}
        label={t("signin:password.title")}
        placeholder={t("signin:password.placeholder")}
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isAuthenticating}
        LeftIcon={!isAuthenticating ? LogIn : undefined}
        type="submit"
      >
        {isAuthenticating ? <Spinner /> : null}
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
