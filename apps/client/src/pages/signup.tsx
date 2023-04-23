import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRGuest } from "@app/hocs/withSSRGuest";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

const SignUpForm = dynamic(
  () => import("@app/components/Forms/SignUp").then((mod) => mod.SignUpForm),
  {
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    ),
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
