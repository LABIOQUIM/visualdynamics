import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/general/buttons";
import { SEO } from "@app/components/seo";

export default function Custom404() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("common:errors.404.title")} />
      <div className="m-auto flex flex-col justify-center gap-y-8 lg:w-1/2">
        <h1 className="text-center text-[8rem] font-bold leading-none">404</h1>
        <p className="text-center text-xl font-medium">
          {t("common:errors.404.description")}
        </p>
        <Button
          LeftIcon={ArrowLeft}
          onClick={() => router.replace("/")}
        >
          {t("common:errors.404.back-to-home")}
        </Button>
      </div>
    </>
  );
}
