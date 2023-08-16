import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { PageLayout } from "aold/components/general/page-layout";
import { SEO } from "aold/components/seo";
import { withSSRGuest } from "aold/hocs/withSSRGuest";

const Form = dynamic(
  () =>
    import("aold/components/account/form-login").then((mod) => mod.FormLogin),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRGuest();

export default function SignIn() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("account-login:title")}
        description={t("account-login:description")}
      />
      <h2 className="text-center text-2xl font-bold uppercase text-primary-700 dark:text-primary-400">
        {t("account-login:title")}
      </h2>
      <Form />
    </PageLayout>
  );
}
