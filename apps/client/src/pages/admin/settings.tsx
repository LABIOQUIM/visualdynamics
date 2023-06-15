import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";

const MDPSettings = dynamic(
  () =>
    import("@app/components/admin/mdp-settings").then(
      (mod) => mod.FormMDPSettings
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminSettings() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("admin-settings:title")}
        description={t("admin-settings:description")}
      />
      <H1 className="uppercase">{t("admin-settings:title")}</H1>

      <div className="grid grid-flow-row grid-cols-3">
        <MDPSettings />
      </div>
    </PageLayout>
  );
}
