import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useIsDynamicRunning } from "@app/hooks/use-is-dynamic-running";

const Form = dynamic(
  () =>
    import("@app/components/simulations/new/form-prodrg").then(
      (mod) => mod.FormPRODRG
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function PRODRGSimulation({ user }: { user: User }) {
  useIsDynamicRunning();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("navigation:simulations.models.prodrg")} />
      <H1>{t("navigation:simulations.models.prodrg")}</H1>
      <Form user={user} />
    </PageLayout>
  );
}
