import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { MyDynamicsHeader } from "@app/components/dynamics/my-dynamics/heading";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useListDynamics } from "@app/queries/useListDynamics";

const EmptyList = dynamic(
  () =>
    import("@app/components/dynamics/my-dynamics/empty").then(
      (m) => m.MyDynamicsEmptyList
    ),
  {
    ssr: false
  }
);

const List = dynamic(
  () =>
    import("@app/components/dynamics/my-dynamics/list").then(
      (m) => m.MyDynamicsList
    ),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function MyDynamics({ user }: { user: User }) {
  const { data, refetch, isRefetching, isLoading } = useListDynamics(
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

  if (data?.status === "listed") {
    return (
      <>
        <SEO title={t("my-dynamics:title")} />
        <MyDynamicsHeader
          refetch={refetch}
          timeUntilRefresh={timeUntilRefresh}
          isLoading={isLoading}
          isRefetching={isRefetching}
        />
        <List dynamics={data.dynamics} />
      </>
    );
  }

  return (
    <>
      <SEO title={t("my-dynamics:title")} />
      <MyDynamicsHeader
        refetch={refetch}
        timeUntilRefresh={timeUntilRefresh}
        isLoading={isLoading}
        isRefetching={isRefetching}
      />
      <EmptyList />
    </>
  );
}
