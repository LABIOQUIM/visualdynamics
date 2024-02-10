import { getVerification } from "@/app/[locale]/(auth)/verify/[verificationId]/getVerification";
import { ValidateButton } from "@/app/[locale]/(auth)/verify/[verificationId]/ValidateButton";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1, H2, Paragraph } from "@/components/Typography";
import { getI18n } from "@/locales/server";

interface Props {
  params: {
    verificationId: string;
  };
}

export default async function Page({ params }: Props) {
  const verification = await getVerification(params.verificationId);
  const t = await getI18n();

  if (!verification) {
    return (
      <PageLayout>
        <div className="flex flex-1 flex-col items-center justify-center">
          <H2>{t("validation.not-found.title")}</H2>
          <Paragraph>{t("validation.not-found.description")}</Paragraph>
        </div>
      </PageLayout>
    );
  }

  if (verification.user.emailVerified) {
    return (
      <PageLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <H1>{t("validation.verified.title")}</H1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <H1>{t("validation.title")}</H1>
        <Paragraph>{t("validation.description")}</Paragraph>
        <ValidateButton validationId={verification.id} />
      </div>
    </PageLayout>
  );
}
