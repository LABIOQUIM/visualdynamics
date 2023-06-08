import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import { SEO } from "@app/components/SEO";
import { H1 } from "@app/components/typography/headings";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useIsDynamicRunning } from "@app/hooks/use-is-dynamic-running";

const ACPYPEForm = dynamic(
  () => import("@app/components/Forms/ACPYPE").then((mod) => mod.ACPYPEForm),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function ACPYPEDynamic({ user }: { user: User }) {
  useIsDynamicRunning();
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("navigation:dynamic.models.acpype")} />
      <H1>{t("navigation:dynamic.models.acpype")}</H1>
      <ACPYPEForm user={user} />
    </>
  );
}
