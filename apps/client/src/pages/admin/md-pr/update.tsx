import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { useAdminMDPRValues } from "@app/queries/useAdminMDPRValues";

const AdminMDPRUpdateForm = dynamic(
  () =>
    import("@app/components/Admin/MDPRUpdate").then(
      (mod) => mod.AdminMDPRUpdateForm
    ),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminMDPRUpdate() {
  const { data, refetch } = useAdminMDPRValues();
  const { t } = useTranslation();

  if (!data) {
    return <FullPageLoader />;
  }

  if (data.status === "not-found") {
    <div>Values not found</div>;
  }

  return (
    <>
      <SEO
        title={t("admin-mdpr-update:title")}
        description={t("admin-mdpr-update:description")}
      />
      <h2 className="text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("admin-mdpr-update:title")}
      </h2>

      <AdminMDPRUpdateForm
        data={data}
        refetch={refetch}
      />
    </>
  );
}
