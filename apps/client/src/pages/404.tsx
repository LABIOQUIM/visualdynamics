import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { PageLayout } from "@app/components/Layout/Page";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

export const getStaticProps = withSSRTranslations(undefined, {
  namespaces: ["common"]
});

export default function Custom404() {
  const router = useRouter();
  const { t } = useTranslation(["common"]);

  return (
    <PageLayout title={t("common:errors.404.title")}>
      <div className="m-auto flex flex-col gap-y-2">
        <h1 className="text-[8rem] font-bold font-grotesk text-center">404</h1>
        <p className="text-xl font-medium font-grotesk text-center">
          {t("common:errors.404.description")}
        </p>
        <Button
          LeftIcon={ArrowLeft}
          onClick={() => router.replace("/")}
        >
          {t("common:errors.404.back-to-home")}
        </Button>
      </div>
    </PageLayout>
  );
}
