import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";

const ActiveUsersList = dynamic(
  () =>
    import("@app/components/admin/users/management/list").then(
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
