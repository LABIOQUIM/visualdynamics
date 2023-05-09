import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRGuest } from "@app/hocs/withSSRGuest";

const SignInForm = dynamic(
  () => import("@app/components/Forms/SignIn").then((mod) => mod.SignInForm),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRGuest();

export default function SignIn() {
  const { t } = useTranslation();

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
