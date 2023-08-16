import { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { useInactiveUsers } from "aold/components/admin/users/validation/useInactiveUsers";
import { useRejectedUsers } from "aold/components/admin/users/validation/useRejectedUsers";
import { AlertFailedToFetch } from "aold/components/general/alerts/failed-to-fetch";
import { Switch } from "aold/components/general/forms/switch";
import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { Spinner } from "aold/components/general/loading-indicator/spinner";
import { PageLayout } from "aold/components/general/page-layout";
import { H1 } from "aold/components/general/typography/headings";
import { SEO } from "aold/components/seo";
import { withSSRAdmin } from "aold/hocs/withSSRAdmin";

const List = dynamic(
  () =>
    import("aold/components/admin/users/validation").then(
      (mod) => mod.UserValidationList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function AdminSignup() {
  const [isRejectedUserList, setIsRejectedUserList] = useState(false);
  const {
    data: inactiveUsers,
    isLoading: isLoadingInactiveUsers,
    isRefetching: isRefetchingInactiveUsers,
    refetch: refetchInactiveUsers
  } = useInactiveUsers();
  const {
    data: rejectedUsers,
    isLoading: isLoadingRejectedUsers,
    isRefetching: isRefetchingRejectedUsers,
    refetch: refetchRejectedUsers
  } = useRejectedUsers();
  const { t } = useTranslation();

  async function approveUser(
    userId: string,
    userEmail: string,
    deleted?: boolean
  ) {
    axios
      .put("/api/users/activate", {
        userId
      })
      .then(() => {
        if (deleted) {
          axios.delete("/api/users/block", {
            params: {
              userId
            }
          });
        }
        axios.get(`/api/mailer/user/approved?to=${userEmail}`);
        if (isRejectedUserList) {
          refetchRejectedUsers();
        } else {
          refetchInactiveUsers();
        }
      });
  }

  async function rejectUser(userId: string, userEmail: string) {
    axios
      .delete("/api/users/block", {
        params: {
          userId
        }
      })
      .then(() => {
        axios.get(`/api/mailer/user/rejected?to=${userEmail}`);
        if (isRejectedUserList) {
          refetchRejectedUsers();
        } else {
          refetchInactiveUsers();
        }
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
        {isLoadingInactiveUsers ||
        isRefetchingInactiveUsers ||
        isLoadingRejectedUsers ||
        isRefetchingRejectedUsers ? (
          <Spinner />
        ) : null}
      </div>
      <Switch
        name="show-rejected"
        onCheckedChange={setIsRejectedUserList}
        checked={isRejectedUserList}
        label={t("admin-user-validation:show-rejected-users")}
      />
      {!isRejectedUserList ? (
        isLoadingInactiveUsers ? (
          <PageLoadingIndicator />
        ) : !inactiveUsers ? (
          <AlertFailedToFetch />
        ) : (
          <List
            inactiveUsers={inactiveUsers}
            approveUser={approveUser}
            rejectUser={rejectUser}
          />
        )
      ) : isLoadingRejectedUsers ? (
        <PageLoadingIndicator />
      ) : !rejectedUsers ? (
        <AlertFailedToFetch />
      ) : (
        <List
          inactiveUsers={rejectedUsers}
          approveUser={approveUser}
          rejectUser={rejectUser}
        />
      )}
    </PageLayout>
  );
}
