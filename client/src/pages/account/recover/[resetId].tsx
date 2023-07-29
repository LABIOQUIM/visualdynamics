import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { SEO } from "@app/components/seo";

const ResetPasswordForm = dynamic(
  () =>
    import("@app/components/account/form-recover").then(
      (mod) => mod.ResetPasswordForm
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export default function ResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <SEO
        title={t("account-recover:title")}
        description={t("account-recover:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("account-recover:title")}
      </h2>
      <ResetPasswordForm resetId={String(router.query.resetId)} />
    </>
  );
}
