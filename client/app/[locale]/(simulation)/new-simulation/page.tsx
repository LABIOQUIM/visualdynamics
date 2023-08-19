import { ACPYPEForm } from "@/app/[locale]/(simulation)/new-simulation/acpype";
import { APOForm } from "@/app/[locale]/(simulation)/new-simulation/apo";
import { createNewAPOSimulation } from "@/app/[locale]/(simulation)/new-simulation/apo/createNewAPOSimulation";
import { PRODRGForm } from "@/app/[locale]/(simulation)/new-simulation/prodrg";
import { TypeSelector } from "@/app/[locale]/(simulation)/new-simulation/TypeSelector";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

type Props = {
  searchParams: {
    type: "apo" | "prodrg" | "acpype" | undefined;
  };
};

export default async function Page({ searchParams }: Props) {
  const t = await getI18n();

  return (
    <PageLayout>
      <H1>{t(`new-simulation.title`)}</H1>
      {searchParams.type === undefined ? <TypeSelector /> : null}
      {searchParams.type === "apo" ? (
        <APOForm createNewAPOSimulation={createNewAPOSimulation} />
      ) : null}
      {searchParams.type === "acpype" ? <ACPYPEForm /> : null}
      {searchParams.type === "prodrg" ? <PRODRGForm /> : null}
    </PageLayout>
  );
}
