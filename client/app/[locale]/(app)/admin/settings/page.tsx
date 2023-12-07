import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

import { AppSettings } from "./AppSettings";
import { MDPSettings } from "./MDPSettings";

export default async function Page() {
  const t = await getI18n();

  return (
    <PageLayout>
      <H1 className="uppercase">{t("admin.settings.title")}</H1>

      <div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-3">
        <MDPSettings />
        <AppSettings />
      </div>
    </PageLayout>
  );
}
