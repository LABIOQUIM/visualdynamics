import { readItems } from "@directus/sdk";

import { KnowledgeLink } from "@/app/[locale]/(cms)/knowledge/KnowledgeLink";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { directusClient } from "@/lib/directus";
import { getI18n } from "@/locales/server";

async function getKnowledgeBase() {
  return await directusClient.request(
    readItems("Knowledge", {
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
  const knowledge = await getKnowledgeBase();
  const t = await getI18n();

  return (
    <PageLayout>
      <H1>{t("navigation.system.knowledge")}</H1>

      {knowledge.length > 0 ? (
        knowledge.map((k) => (
          <KnowledgeLink
            key={k.id}
            knowledge={k}
          />
        ))
      ) : (
        <div>...2</div>
      )}
    </PageLayout>
  );
}
