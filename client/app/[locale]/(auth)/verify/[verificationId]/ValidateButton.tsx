"use client";
import { doValidate } from "@/app/[locale]/(auth)/verify/[verificationId]/doValidate";
import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

interface Props {
  validationId: string;
}

export const ValidateButton = ({ validationId }: Props) => {
  const t = useI18n();

  const validateUser = () => {
    doValidate(validationId);
  };

  return (
    <Button
      className="w-full lg:w-1/3"
      onClick={validateUser}
    >
      {t("validation.buttonText")}
    </Button>
  );
};
