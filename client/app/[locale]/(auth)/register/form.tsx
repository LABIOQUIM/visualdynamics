"use client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  SignUpFormSchema,
  SignUpFormSchemaType
} from "@/app/[locale]/(auth)/register/schema";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Forms/Input";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { useI18n } from "@/locales/client";

type Props = {
  createUser: (data: Prisma.UserCreateInput) => any;
};
export function FormRegister({ createUser }: Props) {
  const t = useI18n();
  const [signUpStatus, setSignUpStatus] = useState("");
  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<SignUpFormSchemaType>({
    resolver: zodResolver(SignUpFormSchema)
  });
  const router = useRouter();

  const handleAuth: SubmitHandler<SignUpFormSchemaType> = async (data) => {
    const createUserReturn = await createUser(data);

    if (typeof createUserReturn === "string") {
      setSignUpStatus(createUserReturn);
    } else {
      reset();
      router.push("/login?from=register");
    }
  };

  return (
    <form
      className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleAuth)}
    >
      <Alert>{t("register.alert")}</Alert>
      {signUpStatus ? ( // @ts-ignore
        <Alert status="danger">{t(`register.errors.${signUpStatus}`)}</Alert>
      ) : null}
      <Input
        error={errors.username}
        label={t("register.username.title")}
        disabled={isSubmitting}
        placeholder={t("register.username.placeholder")}
        {...register("username")}
      />
      <Input
        error={errors.name}
        label={t("register.name.title")}
        placeholder={t("register.name.placeholder")}
        disabled={isSubmitting}
        {...register("name")}
      />
      <Input
        error={errors.email}
        label={t("register.email.title")}
        placeholder={t("register.email.placeholder")}
        disabled={isSubmitting}
        {...register("email")}
      />
      <Input
        error={errors.password}
        label={t("register.password.title")}
        placeholder="********"
        disabled={isSubmitting}
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isSubmitting}
        LeftIcon={!isSubmitting ? UserPlus : undefined}
        type="submit"
      >
        {isSubmitting ? <Spinner /> : null}
        {t("register.title")}
      </Button>
    </form>
  );
}
