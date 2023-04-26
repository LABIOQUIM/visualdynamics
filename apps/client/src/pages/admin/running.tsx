import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { useAdminRunningDynamicsList } from "@app/queries/useAdminRunningDynamicsList";

const AdminRunningDynamicsList = dynamic(
  () =>
    import("@app/components/AdminRunningDynamicsList").then(
      (mod) => mod.AdminRunningDynamicsList
    ),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(withSSRAdmin(), {
  namespaces: ["admin-running"]
});

export default function AdminSignup() {
  const { data, isRefetching, isLoading, refetch } =
    useAdminRunningDynamicsList({
      refetchOnMount: true
    });
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t("admin-running:title")}
        description={t("admin-running:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("admin-running:title")}
      </h2>

      {isLoading || isRefetching || !data ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <AdminRunningDynamicsList
          refetch={refetch}
          runningDynamics={data}
        />
      )}
    </>
  );
}
