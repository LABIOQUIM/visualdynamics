import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRGuest } from "@app/hocs/withSSRGuest";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

const SignUpForm = dynamic(
  () => import("@app/components/Forms/SignUp").then((mod) => mod.SignUpForm),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(withSSRGuest(), {
  namespaces: ["signup"]
});

export default function SignUp() {
  const { t } = useTranslation(["signup"]);

  return (
    <>
      <SEO
        title={t("signup:title")}
        description={t("signup:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("signup:title")}
      </h2>
      <SignUpForm />
    </>
  );
}
