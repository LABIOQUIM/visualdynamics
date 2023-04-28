import axios from "axios";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { useAdminSignUpRequestList } from "@app/queries/useAdminSignUpRequestList";

const AdminSignUpRequestList = dynamic(
  () =>
    import("@app/components/Admin/SignUpRequestList").then(
      (mod) => mod.AdminSignUpRequestList
    ),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(withSSRAdmin(), {
  namespaces: ["admin-signup"]
});

export default function AdminSignup({
  initialData
}: {
  initialData: InactiveUser[];
}) {
  const { data, isLoading, isRefetching, refetch } = useAdminSignUpRequestList({
    initialData
  });
  const { t } = useTranslation();

  async function approveUser(userId: string) {
    axios
      .put("/api/users/activate", {
        userId
      })
      .then(() => refetch());
  }

  async function rejectUser(userId: string) {
    axios
      .delete("/api/users/delete", {
        params: {
          userId
        }
      })
      .then(() => refetch());
  }

  return (
    <>
      <SEO
        title={t("admin-signup:title")}
        description={t("admin-signup:description")}
      />
      <h2 className="flex gap-x-2 text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("admin-signup:title")}
        {isRefetching ? <Spinner /> : null}
      </h2>

      {isLoading ? (
        <FullPageLoader />
      ) : (
        <AdminSignUpRequestList
          inactiveUsers={data}
          approveUser={approveUser}
          rejectUser={rejectUser}
        />
      )}
    </>
  );
}
