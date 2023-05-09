import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";

const ResetPasswordForm = dynamic(
  () =>
    import("@app/components/Forms/ResetPassword").then(
      (mod) => mod.ResetPasswordForm
    ),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export default function ResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <SEO
        title={t("reset-password:title")}
        description={t("reset-password:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("reset-password:title")}
      </h2>
      <ResetPasswordForm resetId={String(router.query.resetId)} />
    </>
  );
}
