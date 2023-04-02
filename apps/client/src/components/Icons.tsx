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
import { X } from "lucide-react";

export type Icon = IconType;

export const Icons = {
  Check: RiCheckLine,
  ChevronDown: RiArrowDownSLine,
  ChevronUp: RiArrowUpSLine,
  Close: X,
  Github: RiGithubFill,
  GooglePlay: RiGooglePlayFill,
  GoBack: RiArrowLeftLine,
  Link: RiLink,
  Logo: GiSaberToothedCatHead
};
