import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fingerprint, Lock, LogIn, LogOut, User, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import {
  AuthFormSchema,
  AuthFormSchemaType
} from "@app/schemas/components/auth/auth.zod";

import { Button } from "../Button";
import { TextButton } from "../Button/Text";
import { Input } from "../Input";
import { SelectTheme } from "../SelectTheme";

export function Auth() {
  const { data: session, status } = useSession();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit
  } = useForm<AuthFormSchemaType>({
    resolver: zodResolver(AuthFormSchema)
  });
  const { t } = useTranslation(["navigation"]);
  const router = useRouter();

  const handleAuth: SubmitHandler<AuthFormSchemaType> = async ({
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

  if (status === "authenticated") {
    return (
      <div className="flex w-full gap-x-2">
        <User className="transition-all duration-500 stroke-primary-950 my-auto min-h-[1.25rem] min-w-[1.25rem]" />
        <div className="flex flex-col gap-y-1 flex-1">
          <div className="flex gap-x-1">
            <p className="uppercase -mb-2 transition-all duration-500 text-sm text-primary-950">
              {session.user.username}
            </p>
            <small className="text-xs -mb-2 text-zinc-500">
              {t(`navigation:auth.role.${session.user.role.toLowerCase()}`)}
            </small>
          </div>
          <small
            title={session.user.email}
            className="text-xs text-zinc-500"
          >
            {session.user.email}
          </small>
        </div>
        <SelectTheme />
        <TextButton
          iconClassName="w-5 h-5"
          LeftIcon={LogOut}
          onClick={() =>
            signOut({
              redirect: false
            })
          }
        />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex gap-x-1">
        <Fingerprint className="h-5 w-5 animate-bounce" />
        <p>{t("navigation:auth.restore")}</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-y-2.5 w-full"
      onSubmit={handleSubmit(handleAuth)}
    >
      <Input
        className="h-8"
        error={errors.identifier}
        label={t("navigation:forms.identifier.title")}
        placeholder={t("navigation:forms.identifier.placeholder")}
        {...register("identifier")}
      />
      <Input
        className="h-8"
        error={errors.password}
        label={t("navigation:forms.password.title")}
        placeholder={t("navigation:forms.password.placeholder")}
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isAuthenticating}
        className="h-8"
        LeftIcon={!isAuthenticating ? LogIn : undefined}
        type="submit"
      >
        {isAuthenticating ? (
          <div
            className="z-0"
            role="status"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-primary-100 animate-spin fill-primary-950"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        ) : null}
        {t("navigation:forms.submit")}
      </Button>
      <div className="flex gap-x-2">
        <TextButton
          className="text-sm"
          iconClassName="h-4 w-4"
          LeftIcon={Lock}
          type="button"
        >
          {t("navigation:forms.lost-password")}
        </TextButton>
        <TextButton
          className="text-sm"
          iconClassName="h-4 w-4"
          LeftIcon={UserPlus}
          onClick={() => router.push("/register")}
          type="button"
        >
          {t("navigation:forms.new-user")}
        </TextButton>
      </div>
    </form>
  );
}
