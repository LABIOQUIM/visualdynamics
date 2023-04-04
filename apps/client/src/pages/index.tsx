import { Input } from "@app/components/Input";
import { PageLayout } from "@app/components/Layout/Page";

export default function Home() {
  return (
    <PageLayout title="pages:home.title">
      <Input
        label="Label"
        type="text"
      />
    </PageLayout>
  );
}
