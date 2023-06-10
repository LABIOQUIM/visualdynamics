import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AlertCircle, AlertTriangle, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import {
  SignUpFormSchema,
  SignUpFormSchemaType
} from "@app/components/account/form-register/schema.zod";
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
    username,
    password
  }) => {
    await axios
      .post("/api/users/signup", {
        email,
        username,
        password
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
      <div className="flex items-center gap-x-2 rounded-lg border border-cyan-500 bg-cyan-400/20 p-2">
        <AlertCircle className="min-h-[1.25rem] min-w-[1.25rem] stroke-cyan-600 dark:stroke-cyan-200" />
        <small className="text-cyan-600 dark:text-cyan-200">
          {t("account-register:alert")}
        </small>
      </div>
      {signUpStatus ? (
        <div className="flex gap-x-2 rounded-lg border border-red-500 bg-red-400/20 p-2">
          <AlertTriangle className="stroke-red-600 dark:stroke-red-200" />
          <p className="text-red-600 dark:text-red-200">
            {t(`account-register:errors.${signUpStatus}`)}
          </p>
        </div>
      ) : null}
      <Input
        error={errors.username}
        label={t("account-register:username.title")}
        disabled={isSubmitting}
        placeholder={t("account-register:username.placeholder")}
        {...register("username")}
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
        placeholder={t("account-register:password.placeholder")}
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
