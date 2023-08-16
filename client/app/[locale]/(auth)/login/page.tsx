import { FormLogin } from "@/app/[locale]/(auth)/login/form";
import { PageLayout } from "@/components/Layouts/PageLayout";

export default function Page() {
  return (
    <PageLayout>
      <FormLogin />
    </PageLayout>
  );
}
