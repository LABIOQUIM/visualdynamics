import { IconTxt, IconZip } from "@tabler/icons-react";

export const nuqsKeys = {
  SIMULATION_EXPANDED_DETAILS: "type",
  SIMULATION_EXPANDED_DETAILS_ACTIVE_TAB: "tab",
} as const;

export const artifactDownload = {
  commands: {
    label: "Commands",
    file: "commands.txt",
    Icon: IconTxt,
    contentType: "text/plain",
  },
  figures: {
    label: "Figures",
    file: "figures.zip",
    Icon: IconZip,
    contentType: "application/octet-stream",
  },
  logs: {
    label: "GROMACS Logs",
    file: "logs.txt",
    Icon: IconTxt,
    contentType: "text/plain",
  },
  results: {
    label: "Results",
    file: "results.zip",
    Icon: IconZip,
    contentType: "application/octet-stream",
  },
  mdp: {
    label: "MDP Files",
    file: "mdpfiles.zip",
    Icon: IconZip,
    contentType: "application/octet-stream",
  },
};
