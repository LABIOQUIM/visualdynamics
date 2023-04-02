import { IconType } from "react-icons";
import { GiSaberToothedCatHead } from "react-icons/gi";
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiCloseFill,
  RiGithubFill,
  RiGooglePlayFill,
  RiLink
} from "react-icons/ri";

export type Icon = IconType;

export const Icons = {
  Check: RiCheckLine,
  ChevronDown: RiArrowDownSLine,
  ChevronUp: RiArrowUpSLine,
  Close: RiCloseFill,
  Github: RiGithubFill,
  GooglePlay: RiGooglePlayFill,
  GoBack: RiArrowLeftLine,
  Link: RiLink,
  Logo: GiSaberToothedCatHead
};
