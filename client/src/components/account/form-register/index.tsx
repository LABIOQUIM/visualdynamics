import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import {
  SignUpFormSchema,
  SignUpFormSchemaType
} from "@app/components/account/form-register/schema.zod";
import { AlertBox } from "@app/components/general/alert-box";
import { Button } from "@app/components/general/buttons";
import { Input } from "@app/components/general/forms/input";
import { Spinner } from "@app/components/general/loading-indicator/spinner";

export function FormRegister() {
  const { t } = useTranslation();
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

  const handleAuth: SubmitHandler<SignUpFormSchemaType> = async ({
    email,
    name,
    password,
    username
  }) => {
    await axios
      .post("/api/users/signup", {
        email,
        name,
        password,
        username
      })
      .then(() => {
        reset();
        router.push("/account/login?from=register");
      })
      .catch(({ response }) => setSignUpStatus(response.data.status));
  };

  return (
    <form
      className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleAuth)}
    >
      <AlertBox>{t("account-register:alert")}</AlertBox>
      {signUpStatus ? (
        <AlertBox status="danger">
          {t(`account-register:errors.${signUpStatus}`)}
        </AlertBox>
      ) : null}
      <Input
        error={errors.username}
        label={t("account-register:username.title")}
        disabled={isSubmitting}
        placeholder={t("account-register:username.placeholder")}
        {...register("username")}
      />
      <Input
        error={errors.name}
        label={t("account-register:name.title")}
        placeholder={t("account-register:name.placeholder")}
        disabled={isSubmitting}
        {...register("name")}
      />
      <Input
        error={errors.email}
        label={t("account-register:email.title")}
        placeholder={t("account-register:email.placeholder")}
        disabled={isSubmitting}
        {...register("email")}
      />
      <Input
        error={errors.password}
        label={t("account-register:password.title")}
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
        {t("account-register:title")}
      </Button>
    </form>
  );
}
