import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { useActiveSimulations } from "@app/components/admin/simulations-running/useActiveSimulations";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";

const List = dynamic(
  () =>
    import("@app/components/admin/simulations-running").then(
      (mod) => mod.SimulationsRunningList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function ActiveSimulations() {
  const { data, isRefetching, isLoading, refetch } = useActiveSimulations({
    refetchOnMount: true
  });
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("admin-active-simulations:title")}
        description={t("admin-active-simulations:description")}
      />
      <div className="flex gap-x-2">
        <H1 className="uppercase">{t("admin-active-simulations:title")}</H1>
        {isLoading || isRefetching ? <Spinner /> : null}
      </div>

      {isLoading ? (
        <PageLoadingIndicator />
      ) : !data ? (
        <AlertFailedToFetch />
      ) : (
        <List
          refetch={refetch}
          workers={data}
        />
      )}
    </PageLayout>
  );
}
