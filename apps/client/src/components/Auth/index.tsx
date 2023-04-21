import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog, Lock, LogIn, LogOut, User, UserPlus } from "lucide-react";
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

interface AuthProps {
  setTheme: (theme: string) => void;
  theme: string;
}

export function Auth({ setTheme, theme }: AuthProps) {
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
  const router = useRouter();

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
        <TextButton
          iconClassName="w-5 h-5"
          LeftIcon={Cog}
        />
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
    return <h1>loading</h1>;
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
        className="h-8"
        LeftIcon={LogIn}
        type="submit"
      >
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
