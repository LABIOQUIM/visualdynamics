import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSPTranslations } from "@app/hocs/withSPTranslations";

const ResetPasswordRequestForm = dynamic(
  () =>
    import("@app/components/Forms/ResetPassword/Request").then(
      (mod) => mod.ResetPasswordRequestForm
    ),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getStaticProps = withSPTranslations(undefined, {
  namespaces: ["reset-password"]
});

export default function ResetPasswordRequest() {
  const { t } = useTranslation(["reset-password"]);
  const { query } = useRouter();

  return (
    <>
      <SEO
        title={t("reset-password:title")}
        description={t("reset-password:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("reset-password:title")}
      </h2>
      {query.reason === "passwordmigration" ? (
        <div className="flex gap-x-2 rounded-lg border border-orange-500 bg-orange-400/20 p-2">
          <AlertTriangle className="stroke-orange-600 dark:stroke-orange-200" />
          <p className="text-orange-600 dark:text-orange-200">
            {t(`reset-password:alerts.${query.reason}`)}
          </p>
        </div>
      ) : null}
      <ResetPasswordRequestForm />
    </>
  );
}
