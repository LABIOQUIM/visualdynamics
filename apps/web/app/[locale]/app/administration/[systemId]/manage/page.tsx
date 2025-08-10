import { Title } from "@mantine/core";
import dynamic from "next/dynamic";

import { GoBackButton } from "@/components/GoBackButton/GoBackButton";
import { Heading } from "@/components/Heading/Heading";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

interface Props {
  params: Promise<{
    systemId: string;
  }>;
}

const getDynamicComponent = (systemId: string) =>
  dynamic(() => import(`@/components/Administration/Manage/${systemId}`), {
    loading: () => <p>Loading...</p>,
  });

export default async function AdminSystemManagePage({ params }: Props) {
  const systemId = (await params).systemId;

  const SystemManage = getDynamicComponent(systemId);

  return (
    <PageLayout style={{ height: "calc(100dvh - 60px - 35.09px)" }}>
      <Heading title="Administration" />
      <SystemManage />
    </PageLayout>
  );
}
