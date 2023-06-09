import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useIsDynamicRunning } from "@app/hooks/use-is-dynamic-running";

const PRODRGForm = dynamic(
  () => import("@app/components/Forms/PRODRG").then((mod) => mod.PRODRGForm),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function PRODRGDynamic({ user }: { user: User }) {
  useIsDynamicRunning();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("navigation:dynamic.models.prodrg")} />
      <H1>{t("navigation:dynamic.models.prodrg")}</H1>
      <PRODRGForm user={user} />
    </PageLayout>
  );
}
