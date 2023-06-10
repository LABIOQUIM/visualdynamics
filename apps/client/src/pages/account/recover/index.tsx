import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { SEO } from "@app/components/seo";

const ResetPasswordRequestForm = dynamic(
  () =>
    import("@app/components/account/form-recover/request").then(
      (mod) => mod.ResetPasswordRequestForm
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export default function ResetPasswordRequest() {
  const { t } = useTranslation();
  const { query } = useRouter();

  return (
    <>
      <SEO
        title={t("account-recover:title")}
        description={t("account-recover:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("account-recover:title")}
      </h2>
      {query.reason === "password-migration" ? (
        <div className="flex gap-x-2 rounded-lg border border-orange-500 bg-orange-400/20 p-2">
          <AlertTriangle className="stroke-orange-600 dark:stroke-orange-200" />
          <p className="text-orange-600 dark:text-orange-200">
            {t(`account-recover:alerts.${query.reason}`)}
          </p>
        </div>
      ) : null}
      <ResetPasswordRequestForm />
    </>
  );
}
