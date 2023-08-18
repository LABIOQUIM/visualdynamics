import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

import { ResetPasswordForm } from "./form";
import { resetUserPassword } from "./resetUserPassword";

export default async function Page({
  params
}: {
  params: { resetId: string };
}) {
  const t = await getI18n();

  return (
    <PageLayout>
      <H1>{t("reset.title")}</H1>
      <ResetPasswordForm
        resetUserPassword={resetUserPassword}
        resetId={params.resetId}
      />
    </PageLayout>
  );
}
