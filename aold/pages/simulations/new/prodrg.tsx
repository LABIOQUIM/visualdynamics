import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "aold/components/general/alert-box";
import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { PageLayout } from "aold/components/general/page-layout";
import { H1 } from "aold/components/general/typography/headings";
import { SEO } from "aold/components/seo";
import { withSSRAuth } from "aold/hocs/withSSRAuth";
import { useIsDynamicRunning } from "../../../hooks/use-is-dynamic-running";

const Form = dynamic(
  () =>
    import("aold/components/simulations/new/form-prodrg").then(
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
      <AlertBox>{t("common:limitations")}</AlertBox>
      <H1>{t("navigation:simulations.models.prodrg")}</H1>
      <Form user={user} />
    </PageLayout>
  );
}
