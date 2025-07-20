import { Title } from "@mantine/core";

import { AdministrationUserList } from "@/components/Administration/Users/UserList";
import { GoBackButton } from "@/components/GoBackButton/GoBackButton";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

export default function Page() {
  return (
    <PageLayout style={{ height: "calc(100dvh - 64px - 35.09px)" }}>
      <GoBackButton />
      <Title order={1}>Registered Users</Title>
      <AdministrationUserList />
    </PageLayout>
  );
}
