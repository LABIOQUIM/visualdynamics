import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { useAdminRunningDynamicsList } from "@app/queries/useAdminRunningDynamicsList";

const AdminRunningDynamicsList = dynamic(
  () =>
    import("@app/components/Admin/RunningDynamicsList").then(
      (mod) => mod.AdminRunningDynamicsList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminSignup() {
  const { data, isRefetching, isLoading, refetch } =
    useAdminRunningDynamicsList({
      refetchOnMount: true
    });
  const { t } = useTranslation();

  function PageCommon() {
    return (
      <>
        <SEO
          title={t("admin-running:title")}
          description={t("admin-running:description")}
        />
        <div className="flex gap-x-2">
          <H1 className="uppercase">{t("admin-running:title")}</H1>
          {isLoading || isRefetching ? <Spinner /> : null}
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageCommon />
        <PageLoadingIndicator />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageCommon />
        <AlertFailedToFetch />
      </>
    );
  }

  return (
    <>
      <PageCommon />

      <AdminRunningDynamicsList
        refetch={refetch}
        runningDynamics={data}
      />
    </>
  );
}
