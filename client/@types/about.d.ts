import { StaticImageData } from "next/image";

declare global {
  interface Maintainer {
    name: string;
    link?: string;
    active: boolean;
    image?: StaticImageData;
    work?: ("idea" | "code" | "manuscript")[];
  }
}
