import { PageLayout } from "@/components/Layout/PageLayout";
import { Logo } from "@/components/Logo";

export default async function Home() {
  return (
    <PageLayout>
      <Logo size="large" />
    </PageLayout>
  );
}
