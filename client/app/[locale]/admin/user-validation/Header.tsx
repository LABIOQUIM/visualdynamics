"use client";

import { useRejectedUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/RevalidateUsers/useRejectedUsers";
import { useInactiveUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/ValidateUsers/useInactiveUsers";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

export function Header() {
  const { isLoading: isLoadingInactiveUsers } = useInactiveUsers();
  const { isLoading: isLoadingRejectedUsers } = useRejectedUsers();
  const t = useI18n();

  return (
    <div className="flex gap-x-2">
      <H1 className="uppercase">{t("admin.validation.title")}</H1>
      {isLoadingInactiveUsers || (isLoadingRejectedUsers && <Spinner />)}
    </div>
  );
}
