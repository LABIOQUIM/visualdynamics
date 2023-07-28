import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "@app/components/general/alert-box";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useIsDynamicRunning } from "@app/hooks/use-is-dynamic-running";

const Form = dynamic(
  () =>
    import("@app/components/simulations/new/form-apo").then(
      (mod) => mod.FormAPO
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function APOSImulation({ user }: { user: User }) {
  useIsDynamicRunning();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("navigation:simulations.models.apo")} />
      <AlertBox>{t("common:limitations")}</AlertBox>
      <H1>{t("navigation:simulations.models.apo")}</H1>
      <Form user={user} />
    </PageLayout>
  );
}
