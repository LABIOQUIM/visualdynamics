import { H2, Paragraph } from "@/components/Typography";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { dateFormat } from "@/utils/dateFormat";

type Props = {
  info: Simulation & {
    folder: string;
    celeryId: string;
  };
};

export function Details({ info }: Props) {
  const t = useI18n();
  const locale = useCurrentLocale();

  return (
    <div className="flex flex-col gap-2">
      <H2>{t("running-simulation.description")}</H2>
      <Paragraph>
        {t("simulations.molecule", {
          molecule: <b>{info.moleculeName}</b>
        })}
      </Paragraph>
      <Paragraph>
        {t("running-simulation.type", {
          simulationType: <b>{info.type}</b>
        })}
      </Paragraph>
      <Paragraph>
        {t("simulations.createdAt", {
          time: <b>{dateFormat(info.createdAt, locale)}</b>
        })}
      </Paragraph>
      {info.startedAt && (
        <Paragraph>
          {t("simulations.startedAt", {
            time: <b>{dateFormat(info.startedAt, locale)}</b>
          })}
        </Paragraph>
      )}
    </div>
  );
}
