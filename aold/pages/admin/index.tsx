import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "aold/components/general/alert-box";
import { PageLayout } from "aold/components/general/page-layout";
import { H1 } from "aold/components/general/typography/headings";
import { SEO } from "aold/components/seo";

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
