import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "aold/components/general/alert-box";
import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { PageLayout } from "aold/components/general/page-layout";
import { SEO } from "aold/components/seo";
import { MySimulationsHeader } from "aold/components/simulations/header";
import { useUserSimulations } from "aold/components/simulations/useUserSimulations";
import { withSSRAuth } from "aold/hocs/withSSRAuth";

const EmptyList = dynamic(
  () =>
    import("aold/components/simulations/empty").then(
      (m) => m.MyDynamicsEmptyList
    ),
  {
    ssr: false
  }
);

const List = dynamic(
  () =>
    import("aold/components/simulations/list").then((m) => m.MySimulationsList),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function MySimulations({ user }: { user: User }) {
  const { data, refetch, isRefetching, isLoading } = useUserSimulations(
    user.username,
    {
      refetchOnMount: true
    }
  );
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(60);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefetching) {
        setTimeUntilRefresh((currentTime) => currentTime - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRefetching]);

  useEffect(() => {
    if (isRefetching) {
      setTimeUntilRefresh(60);
    }

    if (timeUntilRefresh <= 0) {
      refetch();
    }
  }, [isRefetching, refetch, timeUntilRefresh]);

  return (
    <PageLayout>
      <SEO title={t("simulations:title")} />
      <AlertBox>{t("common:limitations")}</AlertBox>
      <MySimulationsHeader
        refetch={refetch}
        timeUntilRefresh={timeUntilRefresh}
        isLoading={isLoading}
        isRefetching={isRefetching}
      />
      {isLoading || !data ? (
        <PageLoadingIndicator />
      ) : data.status === "has-simulations" ? (
        <List simulations={data.simulations} />
      ) : (
        <EmptyList />
      )}
    </PageLayout>
  );
}
