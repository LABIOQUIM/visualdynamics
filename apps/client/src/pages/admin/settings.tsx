import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { useMDConfig } from "@app/components/admin/md-config/useMDConfig";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";

const MDConfig = dynamic(
  () =>
    import("@app/components/admin/md-config").then((mod) => mod.FormMDConfig),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminMDPRUpdate() {
  const { data, refetch, isLoading, isRefetching } = useMDConfig();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("admin-md-config:title")}
        description={t("admin-md-config:description")}
      />
      <div className="flex gap-x-2">
        <H1 className="uppercase">{t("admin-md-config:title")}</H1>
        {isLoading || isRefetching ? <Spinner /> : null}
      </div>

      {isLoading ? (
        <PageLoadingIndicator />
      ) : !data ? (
        <AlertFailedToFetch />
      ) : (
        <MDConfig
          data={data}
          refetch={refetch}
        />
      )}
    </PageLayout>
  );
}
