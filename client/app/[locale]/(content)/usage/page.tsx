import { PageLayout } from "@/components/Layouts/PageLayout";
import { getI18n } from "@/locales/server";

export async function generateMetadata() {
  const t = await getI18n();

  return {
    title: t("navigation.system.usage")
  };
}

export default function Page() {
  return (
    <PageLayout>
      <iframe
        width="100%"
        height="100%"
        src="https://lookerstudio.google.com/embed/reporting/c52ec58d-916c-4291-b5db-10f6e9df6e85/page/fhpXD"
      />
    </PageLayout>
  );
}
