import dynamic from "next/dynamic";
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

  return (
    <>
      <SEO
        title={t("reset-password:title")}
        description={t("reset-password:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("reset-password:title")}
      </h2>
      <ResetPasswordRequestForm />
    </>
  );
}
