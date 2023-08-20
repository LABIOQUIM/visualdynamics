import { SimulationInfo } from "@/app/[locale]/(simulation)/running-simulation/getRunningSimulation";
import { H2, Paragraph } from "@/components/Typography";
import { useI18n } from "@/locales/client";
import { dateFormat } from "@/utils/dateFormat";

type Props = {
  info: SimulationInfo;
};

export function Details({ info }: Props) {
  const t = useI18n();

  return (
    <div className="flex flex-col gap-2">
      <H2>{t("running-simulation.description")}</H2>
      <Paragraph>
        {t("running-simulation.molecule", {
          moleculeName: info.molecule
        })}
      </Paragraph>
      <Paragraph>
        {t("running-simulation.type", {
          simulationType: info.type
        })}
      </Paragraph>
      <Paragraph>
        {t("running-simulation.createdAt", {
          formattedDate: dateFormat(new Date(info.timestamp))
        })}
      </Paragraph>
    </div>
  );
}
