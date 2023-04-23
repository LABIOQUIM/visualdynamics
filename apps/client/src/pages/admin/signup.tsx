import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { useTranslation } from "next-i18next";

import { AdminSignUpRequestList } from "@app/components/AdminSignUpRequestList";
import { StatusButton } from "@app/components/Button/Status";
import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { useAdminSignUpRequestList } from "@app/queries/useAdminSignUpRequestList";

export const getServerSideProps = withSSRTranslations(withSSRAdmin(), {
  namespaces: ["admin-signup"]
});

export default function AdminSignup() {
  const { data, isLoading, isRefetching, refetch } =
    useAdminSignUpRequestList();
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
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("admin-signup:title")}
      </h2>

      {isLoading || isRefetching ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
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
