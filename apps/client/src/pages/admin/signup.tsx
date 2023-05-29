import axios from "axios";
import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { AlertFailedToFetch } from "@app/components/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { H1 } from "@app/components/typography/headings";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { useAdminSignUpRequestList } from "@app/queries/useAdminSignUpRequestList";

const AdminSignUpRequestList = dynamic(
  () =>
    import("@app/components/Admin/SignUpRequestList").then(
      (mod) => mod.AdminSignUpRequestList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminSignup({
  initialData
}: {
  initialData: InactiveUser[];
}) {
  const { data, isLoading, isRefetching, refetch } = useAdminSignUpRequestList({
    initialData
  });
  const { t } = useTranslation();

  async function approveUser(userId: string, userEmail: string) {
    axios
      .put("/api/users/activate", {
        userId
      })
      .then(() => {
        axios.get(`/api/mailer/user/approved?email=${userEmail}`);
        refetch();
      });
  }

  async function rejectUser(userId: string, userEmail: string) {
    axios
      .delete("/api/users/delete", {
        params: {
          userId
        }
      })
      .then(() => {
        axios.get(`/api/mailer/user/rejected?email=${userEmail}`);
        refetch();
      });
  }

  function PageCommon() {
    return (
      <>
        <SEO
          title={t("admin-signup:title")}
          description={t("admin-signup:description")}
        />
        <div className="flex gap-x-2">
          <H1 className="uppercase">{t("admin-signup:title")}</H1>
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

      <AdminSignUpRequestList
        inactiveUsers={data}
        approveUser={approveUser}
        rejectUser={rejectUser}
      />
    </>
  );
}
