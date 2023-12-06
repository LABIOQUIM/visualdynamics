import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.svg";
import { Button } from "@/components/Button";
import { H2 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

export default async function Header() {
  const t = await getI18n();

  return (
    <div className="container mx-auto flex h-20 justify-between">
      <div className="flex flex-1 items-center gap-4">
        <Link href="/">
          <Button
            LeftIcon={ArrowLeft}
            isOutline
            noBorder
          >
            {t("docs.back")}
          </Button>
        </Link>
        <div className="h-10 w-0.5 bg-neutral-100" />
        <Image
          alt=""
          className="h-14 w-auto"
          src={logo}
          priority
        />
        <H2>{t("docs.title")}</H2>
      </div>
    </div>
  );
}
