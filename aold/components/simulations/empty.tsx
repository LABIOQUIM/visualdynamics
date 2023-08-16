import { ArrowRight, Microscope } from "lucide-react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import { Button } from "aold/components/general/buttons";

export function MyDynamicsEmptyList() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex flex-1 flex-col justify-center lg:w-1/2">
      <Microscope className="stoke-primary-950 mx-auto mb-2 h-14 w-14 dark:stroke-primary-400" />
      <h1 className="text-center text-2xl font-bold uppercase text-primary-950 dark:text-primary-400">
        {t("simulations:empty.title")}
      </h1>
      <p className="text-center">{t("simulations:empty.description")}</p>

      <div className="mx-auto mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/simulations/new/apo">
          <Button RightIcon={ArrowRight}>
            {t("navigation:simulations.models.apo")}
          </Button>
        </Link>
        <Link href="/simylations/new/acpype">
          <Button RightIcon={ArrowRight}>
            {t("navigation:simulations.models.acpype")}
          </Button>
        </Link>
        <Link href="/simylations/new/prodrg">
          <Button RightIcon={ArrowRight}>
            {t("navigation:simulations.models.prodrg")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
