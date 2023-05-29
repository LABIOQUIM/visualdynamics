import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { AlertFailedToFetch } from "@app/components/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { H1 } from "@app/components/typography/headings";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { useAdminMDPRValues } from "@app/queries/useAdminMDPRValues";

const AdminMDPRUpdateForm = dynamic(
  () =>
    import("@app/components/Admin/MDPRUpdate").then(
      (mod) => mod.AdminMDPRUpdateForm
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminMDPRUpdate() {
  const { data, refetch, isLoading, isRefetching } = useAdminMDPRValues();
  const { t } = useTranslation();

  function PageCommon() {
    return (
      <>
        <SEO
          title={t("admin-mdpr-update:title")}
          description={t("admin-mdpr-update:description")}
        />
        <div className="flex gap-x-2">
          <H1 className="uppercase">{t("admin-mdpr-update:title")}</H1>
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

      <AdminMDPRUpdateForm
        data={data}
        refetch={refetch}
      />
    </>
  );
}
