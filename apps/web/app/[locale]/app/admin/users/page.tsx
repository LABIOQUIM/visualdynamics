import { AdministrationUserList } from "@/components/Administration/Users/UserList";
import { Heading } from "@/components/Heading/Heading";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

export default function Page() {
  return (
    <PageLayout>
      <Heading title="Registered Users" />
      <AdministrationUserList />
    </PageLayout>
  );
}
