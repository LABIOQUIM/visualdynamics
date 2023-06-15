import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "@app/components/general/alert-box";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("common:wip")} />
      <H1>{t("common:wip")}</H1>

      <AlertBox>Texto</AlertBox>
      <AlertBox status="success">Texto</AlertBox>
      <AlertBox status="warning">Texto</AlertBox>
      <AlertBox status="danger">Texto</AlertBox>
    </PageLayout>
  );
}
