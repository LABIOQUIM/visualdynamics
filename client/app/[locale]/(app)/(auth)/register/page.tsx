import { createUser } from "@/app/[locale]/(app)/(auth)/register/createUser";
import { FormRegister } from "@/app/[locale]/(app)/(auth)/register/form";
import { PageLayout } from "@/components/Layouts/PageLayout";

export default function Page() {
  return (
    <PageLayout>
      <FormRegister createUser={createUser} />
    </PageLayout>
  );
}
