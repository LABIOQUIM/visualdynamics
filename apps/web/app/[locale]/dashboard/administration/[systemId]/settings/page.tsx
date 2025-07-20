import { Title } from "@mantine/core";

import { SystemMode } from "@/components/Administration/Settings/Mode";
import { GoBackButton } from "@/components/GoBackButton/GoBackButton";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

interface Props {
  params: Promise<{
    systemId: string;
  }>;
}

export default async function SystemSettingsPage({ params }: Props) {
  const systemId = (await params).systemId;

  return (
    <PageLayout>
      <GoBackButton />
      <Title>Settings for {systemId.toUpperCase()}</Title>
      <SystemMode systemId={systemId} />
    </PageLayout>
  );
}
