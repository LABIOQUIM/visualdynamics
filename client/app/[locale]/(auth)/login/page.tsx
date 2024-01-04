import { PageLayout } from "@/components/Layouts/PageLayout";
import { getI18n } from "@/locales/server";

import { FormLogin } from "./form";

export async function generateMetadata() {
  const t = await getI18n();

  return {
    title: t("navigation.auth.login")
  };
}

export default function Page() {
  return (
    <PageLayout>
      <FormLogin />
    </PageLayout>
  );
}
