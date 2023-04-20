import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import {
  AuthFormSchema,
  AuthFormSchemaType
} from "@app/schemas/components/auth/auth.zod";

import { Button } from "../Button";
import { TextButton } from "../Button/Text";
import { Input } from "../Input";

export function Auth() {
  const { data: session, status } = useSession();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit
  } = useForm<AuthFormSchemaType>({
    resolver: zodResolver(AuthFormSchema)
  });
  const { t } = useTranslation(["navigation"]);

  const handleAuth: SubmitHandler<AuthFormSchemaType> = async ({
    identifier,
    password
  }) => {
    signIn("credentials", {
      identifier,
      password,
      redirect: false
    }).then(() => reset());
  };

  if (status === "authenticated") {
    return (
      <div className="flex w-full gap-x-2">
        <User className="stroke-primary-950 my-auto h-7 w-7" />
        <div className="flex flex-col gap-y-1 flex-1">
          <div className="flex gap-x-1">
            <p className="uppercase -mb-2 text-sm text-primary-950">
              {session.user.username}
            </p>
            <small className="text-xs -mb-2 text-zinc-500">
              {t(`navigation:auth.role.${session.user.role.toLowerCase()}`)}
            </small>
          </div>
          <small className="text-xs text-zinc-500">{session.user.email}</small>
        </div>
        <TextButton
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
    return <h1>loading</h1>;
  }

  return (
    <>
      <div className="flex gap-x-1.5 w-full -mb-4 text-primary-950 transition-all duration-500">
        <LogIn className="h-5 w-5 my-auto stroke-[3]" />
        <h3 className="font-medium text-xl">{t("navigation:forms.submit")}</h3>
      </div>
      <form
        className="flex flex-col w-full gap-y-2.5"
        onSubmit={handleSubmit(handleAuth)}
      >
        <Input
          error={errors.identifier}
          label={t("navigation:forms.identifier.title")}
          placeholder={t("navigation:forms.identifier.placeholder")}
          {...register("identifier")}
        />
        <Input
          error={errors.password}
          label={t("navigation:forms.password.title")}
          placeholder={t("navigation:forms.password.placeholder")}
          type="password"
          {...register("password")}
        />
        <Button
          LeftIcon={LogIn}
          type="submit"
        >
          {t("navigation:forms.submit")}
        </Button>
        <TextButton
          className="text-sm"
          iconClassName="h-4 w-4"
          LeftIcon={Lock}
          type="button"
        >
          {t("navigation:forms.lost-password")}
        </TextButton>
      </form>
    </>
  );
}
