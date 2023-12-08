import { approveUser } from "@/app/[locale]/admin/user-validation/approveUser";
import { rejectUser } from "@/app/[locale]/admin/user-validation/rejectUser";
import { Validation } from "@/app/[locale]/admin/user-validation/Validation";
import { PageLayout } from "@/components/Layouts/PageLayout";

export default function Page() {
  return (
    <PageLayout>
      <Validation
        approveUser={approveUser}
        rejectUser={rejectUser}
      />
    </PageLayout>
  );
}
