import { Box, Title } from "@mantine/core";
import dynamic from "next/dynamic";

import { GoBackButton } from "@/components/GoBackButton/GoBackButton";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

import classes from "./page.module.css";

const getDynamicComponent = (systemId: string) =>
  dynamic(() => import(`@/components/Administration/Status/${systemId}`), {
    loading: () => <p>Loading...</p>,
  });

interface Props {
  params: Promise<{
    systemId: string;
  }>;
}

export default async function SystemStatusPage({ params }: Props) {
  const systemId = (await params).systemId;

  const SystemStatus = getDynamicComponent(systemId);

  return (
    <PageLayout>
      <GoBackButton />
      <Title>Status for {systemId.toUpperCase()}</Title>
      <Box className={classes.container}>
        <SystemStatus />
      </Box>
    </PageLayout>
  );
}
