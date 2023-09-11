import { readItems } from "@directus/sdk";

import { DocLink } from "@/app/[locale]/(cms)/docs/DocLink";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { directusClient } from "@/lib/directus";
import { getI18n } from "@/locales/server";

async function getDocs() {
  return await directusClient.request(
    readItems("Documentation", {
      fields: [
        "id",
        "title",
        "status",
        "date_created",
        "date_updated",
        { user_created: ["first_name"], user_updated: ["first_name"] }
      ]
    })
  );
}

export default async function Page() {
  const docs = await getDocs();
  const t = await getI18n();

  return (
    <PageLayout>
      <H1>{t("navigation.system.docs")}</H1>

      {docs.length > 0 ? (
        docs.map((doc) => (
          <DocLink
            doc={doc}
            key={doc.id}
          />
        ))
      ) : (
        <div>...2</div>
      )}
    </PageLayout>
  );
}
