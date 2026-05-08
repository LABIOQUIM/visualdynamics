import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import type { NavigateFn } from "@tanstack/react-router";

import { getAPIClient } from "@/lib/api";
import type { SimulationFormValues } from "@/routes/app/submit/-components/schema";

export async function submitSimulation(
  values: SimulationFormValues,
  navigate: NavigateFn,
  shouldRun?: boolean,
) {
  const data = new FormData();
  data.append("type", values.type);
  data.append("filePDB", values.filePDB);
  if (values.type !== "apo" && values.ligands) {
    for (const ligand of values.ligands) {
      data.append("fileLigandITP", ligand.fileITP);
      data.append("fileLigandPDB", ligand.filePDB);
    }
  }
  data.append("forceField", values.forceField);
  data.append("waterModel", values.waterModel);
  data.append("boxType", values.boxType);
  data.append("boxDistance", String(values.boxDistance));

  if (shouldRun) {
    data.append("shouldRun", "true");
    data.append("successEmail", "ended success");
    data.append("errorEmail", "ended fail");
  }

  const api = await getAPIClient();

  const response = await api.post<{ commands: string[] }>(
    `/simulation/submit`,
    data,
  );

  if (!shouldRun) {
    let filename = values.type;
    filename += `-${values.filePDB.name.split(".")[0]}`;

    if (values.ligands) {
      for (const ligand of values.ligands) {
        filename += `-${ligand.fileITP.name.split(".")[0]}`;
      }
    }

    filename += "-commands.txt";

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(response.data.commands.join("")),
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    notifications.show({
      title: "Commands downloaded!",
      message: "Your simulation commands have been generated and downloaded.",
      color: "green",
      icon: <IconCheck />,
      withBorder: true,
    });

    return;
  } else {
    notifications.show({
      title: "Added to queue",
      message: "Your simulation has been added to the execution queue.",
      color: "green",
      icon: <IconCheck />,
      withBorder: true,
    });

    navigate({ to: "/app", search: { type: values.type, tab: "run" } });

    return;
  }
}
