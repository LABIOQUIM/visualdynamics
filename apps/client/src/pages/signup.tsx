import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRGuest } from "@app/hocs/withSSRGuest";

const SignUpForm = dynamic(
  () => import("@app/components/Forms/SignUp").then((mod) => mod.SignUpForm),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRGuest();

export default function SignUp() {
  const { t } = useTranslation();

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
