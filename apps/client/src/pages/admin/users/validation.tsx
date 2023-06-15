import axios from "axios";
import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { useInactiveUsers } from "@app/components/admin/users/validation/useInactiveUsers";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";

const List = dynamic(
  () =>
    import("@app/components/admin/users/validation").then(
      (mod) => mod.UserValidationList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminSignup() {
  const { data, isLoading, isRefetching, refetch } = useInactiveUsers();
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

  return (
    <PageLayout>
      <SEO
        title={t("admin-user-validation:title")}
        description={t("admin-user-validation:description")}
      />
      <div className="flex gap-x-2">
        <H1 className="uppercase">{t("admin-user-validation:title")}</H1>
        {isLoading || isRefetching ? <Spinner /> : null}
      </div>
      {isLoading ? (
        <PageLoadingIndicator />
      ) : !data ? (
        <AlertFailedToFetch />
      ) : (
        <List
          inactiveUsers={data}
          approveUser={approveUser}
          rejectUser={rejectUser}
        />
      )}
    </PageLayout>
  );
}
