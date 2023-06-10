import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { PageLayout } from "@app/components/general/page-layout";
import { SEO } from "@app/components/seo";
import { MySimulationsHeader } from "@app/components/simulations/header";
import { useUserSimulations } from "@app/components/simulations/useUserSimulations";
import { withSSRAuth } from "@app/hocs/withSSRAuth";

const EmptyList = dynamic(
  () =>
    import("@app/components/simulations/empty").then(
      (m) => m.MyDynamicsEmptyList
    ),
  {
    ssr: false
  }
);

const List = dynamic(
  () =>
    import("@app/components/simulations/list").then((m) => m.MySimulationsList),
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
