"use client";

import { sendValidationEmailIfNeeded } from "@/app/[locale]/admin/user-validation/sendValidationEmailIfNeeded";
import { useRejectedUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/RevalidateUsers/useRejectedUsers";
import { useInactiveUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/ValidateUsers/useInactiveUsers";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

export function Header() {
  const { isLoading: isLoadingInactiveUsers } = useInactiveUsers();
  const { isLoading: isLoadingRejectedUsers } = useRejectedUsers();
  const t = useI18n();

  const requestValidation = () => {
    sendValidationEmailIfNeeded();
  };

  return (
    <div className="flex gap-x-2">
      <H1 className="uppercase">{t("admin.validation.title")}</H1>
      <Button onClick={requestValidation}>
        {t("admin.validation.request-validation")}
      </Button>
      {isLoadingInactiveUsers || (isLoadingRejectedUsers && <Spinner />)}
    </div>
  );
}
