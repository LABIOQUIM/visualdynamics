import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AlertTriangle, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { Spinner } from "@app/components/Spinner";
import {
  SignUpFormSchema,
  SignUpFormSchemaType
} from "@app/schemas/components/auth/signup.zod";

export function SignUpForm() {
  const { t } = useTranslation(["signup"]);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpStatus, setSignUpStatus] = useState<
    | {
        status: "success";
      }
    | {
        status: "error";
        errorMessage: string;
      }
  >();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit
  } = useForm<SignUpFormSchemaType>({
    resolver: zodResolver(SignUpFormSchema)
  });
  const router = useRouter();

  useEffect(() => {
    if (signUpStatus?.status === "success") {
      router.push("/signin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signUpStatus]);

  const handleAuth: SubmitHandler<SignUpFormSchemaType> = async ({
    email,
    username,
    password
  }) => {
    setIsSigningUp(true);
    axios
      .post("/api/users/signup", {
        email,
        username,
        password
      })
      .then(() => {
        setSignUpStatus({ status: "success" });
        reset();
      })
      .catch(({ response }) =>
        setSignUpStatus({ status: "error", errorMessage: response.data.status })
      )
      .finally(() => setIsSigningUp(false));
  };

  return (
    <form
      className="flex flex-col gap-y-2.5 lg:mx-auto lg:w-1/2"
      onSubmit={handleSubmit(handleAuth)}
    >
      {signUpStatus?.status === "error" ? (
        <div className="flex gap-x-2 rounded-lg border border-red-500 bg-red-400/20 p-2">
          <AlertTriangle className="stroke-red-600 dark:stroke-red-200" />
          <p className="text-red-600 dark:text-red-200">
            {t(`signup:errors.${signUpStatus.errorMessage}`)}
          </p>
        </div>
      ) : null}
      <Input
        error={errors.username}
        label={t("signup:username.title")}
        placeholder={t("signup:username.placeholder")}
        {...register("username")}
      />
      <Input
        error={errors.email}
        label={t("signup:email.title")}
        placeholder={t("signup:email.placeholder")}
        {...register("email")}
      />
      <Input
        error={errors.password}
        label={t("signup:password.title")}
        placeholder={t("signup:password.placeholder")}
        type="password"
        {...register("password")}
      />
      <Button
        disabled={isSigningUp}
        LeftIcon={!isSigningUp ? UserPlus : undefined}
        type="submit"
      >
        {isSigningUp ? <Spinner /> : null}
        {t("signup:title")}
      </Button>
    </form>
  );
}
