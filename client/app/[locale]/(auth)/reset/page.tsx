import { NextPage } from "next";

import { createUserPasswordReset } from "@/app/[locale]/(auth)/reset/createUserPasswordReset";
import { ResetPasswordRequestForm } from "@/app/[locale]/(auth)/reset/form";
import { Alert } from "@/components/Alert";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

export default async function Page({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getI18n();

  return (
    <PageLayout>
      <H1>{t("reset.title")}</H1>
      {searchParams.reason === "password-migration" ? (
        <Alert>{t(`reset.alerts.passwordmigration`)}</Alert>
      ) : null}
      <ResetPasswordRequestForm
        createUserPasswordReset={createUserPasswordReset}
      />
    </PageLayout>
  );
}
