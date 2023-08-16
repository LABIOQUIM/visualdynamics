import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { PageLayout } from "aold/components/general/page-layout";
import { H1 } from "aold/components/general/typography/headings";
import { SEO } from "aold/components/seo";
import { withSSRAdmin } from "aold/hocs/withSSRAdmin";

const MDPSettings = dynamic(
  () =>
    import("aold/components/admin/mdp-settings").then(
      (mod) => mod.FormMDPSettings
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

const AppSettings = dynamic(
  () =>
    import("aold/components/admin/app-settings").then(
      (mod) => mod.FormAppSettings
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

      <div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-3">
        <MDPSettings />
        <AppSettings />
      </div>
    </PageLayout>
  );
}
