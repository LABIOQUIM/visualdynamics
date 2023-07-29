import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { PageLayout } from "@app/components/general/page-layout";
import { SEO } from "@app/components/seo";
import { withSSRGuest } from "@app/hocs/withSSRGuest";

const Form = dynamic(
  () =>
    import("@app/components/account/form-register").then(
      (mod) => mod.FormRegister
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRGuest();

export default function SignUp() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("account-register:title")}
        description={t("account-register:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("account-register:title")}
      </h2>
      <Form />
    </PageLayout>
  );
}
