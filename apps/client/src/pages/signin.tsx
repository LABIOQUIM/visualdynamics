import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRGuest } from "@app/hocs/withSSRGuest";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

const SignInForm = dynamic(
  () => import("@app/components/Forms/SignIn").then((mod) => mod.SignInForm),
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
  namespaces: ["signin"]
});

export default function SignIn() {
  const { t } = useTranslation(["signin"]);

  return (
    <>
      <SEO
        title={t("signin:title")}
        description={t("signin:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("signin:title")}
      </h2>
      <SignInForm />
    </>
  );
}
