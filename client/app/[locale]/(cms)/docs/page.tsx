import dynamic from "next/dynamic";

import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { fetchPages } from "@/lib/notion";
import { getI18n } from "@/locales/server";

const NotionPage = dynamic(() => import("@/components/NotionPage"), {
  ssr: false
});

export default async function Page() {
  const data = await fetchPages();
  const t = await getI18n();

  return (
    <PageLayout className="container mx-auto">
      <H1>{t("navigation.system.docs")}</H1>
      <NotionPage recordMap={data} />
    </PageLayout>
  );
}
