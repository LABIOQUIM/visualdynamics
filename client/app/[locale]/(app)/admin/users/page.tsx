import { ActiveUserList } from "@/app/[locale]/(app)/admin/users/ActiveUserList";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

export default async function Page() {
  const t = await getI18n();

  return (
    <PageLayout>
      <H1>{t("admin.users.title")}</H1>
      <ActiveUserList />
    </PageLayout>
  );
}
