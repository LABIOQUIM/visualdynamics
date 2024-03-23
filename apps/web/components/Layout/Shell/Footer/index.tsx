import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";

import EpiAmOBlackLogo from "@/assets/epiamo-black.png";
import EpiAmOWhiteLogo from "@/assets/epiamo-white.png";
import fiocruzROLogo from "@/assets/fiocruz-ro.png";
import labioquimLogo from "@/assets/labioquim.png";
import unirLogo from "@/assets/unir.png";
import unirWhiteLogo from "@/assets/unir-white.png";
import { useIsDarkTheme } from "@/hooks/useIsDarkTheme";

import classes from "./Footer.module.css";

export function Footer() {
  const isDark = useIsDarkTheme();
  const [epiamo, setEpiamo] = useState<StaticImageData>(EpiAmOBlackLogo);
  const [unir, setUnir] = useState<StaticImageData>(unirLogo);

  useEffect(() => {
    setEpiamo(isDark ? EpiAmOWhiteLogo : EpiAmOBlackLogo);
    setUnir(isDark ? unirWhiteLogo : unirLogo);
  }, [isDark]);

  return (
    <div className={classes.makers}>
      <Image alt="" className={classes.makerImage} src={labioquimLogo} />
      <Image alt="" className={classes.makerImage} src={fiocruzROLogo} />
      <Image alt="" className={classes.makerImageEpi} src={epiamo} />
      <Image alt="" className={classes.makerImage} src={unir} />
    </div>
  );
}
