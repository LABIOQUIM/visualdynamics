import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { PageLayout } from "aold/components/general/page-layout";
import { H1 } from "aold/components/general/typography/headings";
import { SEO } from "aold/components/seo";

const ActiveUsersList = dynamic(
  () =>
    import("aold/components/admin/users/management/list").then(
      (m) => m.ActiveUsersList
    ),
  { ssr: false }
);

export default function AdminUsers() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("admin-users:title")} />
      <H1>{t("admin-users:title")}</H1>

      <ActiveUsersList />
    </PageLayout>
  );
}
