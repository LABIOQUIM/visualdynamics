import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useIsDynamicRunning } from "@app/hooks/use-is-dynamic-running";

const APOForm = dynamic(
  () => import("@app/components/Forms/APO").then((mod) => mod.APOForm),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function APODynamic({ user }: { user: User }) {
  useIsDynamicRunning();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("navigation:dynamic.models.apo")} />
      <H1>{t("navigation:dynamic.models.apo")}</H1>
      <APOForm user={user} />
    </PageLayout>
  );
}
