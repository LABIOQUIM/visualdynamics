import { PageLayout } from "@/components/Layouts/PageLayout";
import { Spinner } from "@/components/LoadingIndicators/Spinner";

export default function Loading() {
  return (
    <PageLayout className="items-center justify-center">
      <Spinner />
    </PageLayout>
  );
}
