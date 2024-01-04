import { createUser } from "@/app/[locale]/(auth)/register/createUser";
import { FormRegister } from "@/app/[locale]/(auth)/register/form";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { getI18n } from "@/locales/server";

export async function generateMetadata() {
  const t = await getI18n();

  return {
    title: t("navigation.auth.register")
  };
}

export default function Page() {
  return (
    <PageLayout>
      <FormRegister createUser={createUser} />
    </PageLayout>
  );
}
