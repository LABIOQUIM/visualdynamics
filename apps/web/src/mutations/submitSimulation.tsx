import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

import type { SimulationSubmitFormValues } from "@/components/SimulationSubmit/FormContext";
import { getAPIClient } from "@/lib/api";

export async function submitSimulation(
  values: SimulationSubmitFormValues,
  shouldRun?: boolean,
) {
  const data = new FormData();
  data.append("filePDB", values.filePDB);
  if (values.type !== "apo") {
    data.append("fileLigandITP", values.fileLigandITP!);
    data.append("fileLigandPDB", values.fileLigandPDB!);
  }
  data.append("forceField", values.forceField);
  data.append("waterModel", values.waterModel);
  data.append("boxType", values.boxType);
  data.append("boxDistance", values.boxDistance);

  if (shouldRun) {
    data.append("shouldRun", "true");
    data.append("successEmail", "ended success");
    data.append("errorEmail", "ended fail");
  }

  const api = await getAPIClient();

  const response = await api.post(`/simulation/${values.type}`, data);

  if (!shouldRun) {
    let filename = values.type;
    filename += `-${values.filePDB.name.split(".")[0]}`;

    if (values.fileLigandITP) {
      filename += `-${values.fileLigandITP.name.split(".")[0]}`;
    }

    if (values.fileLigandPDB) {
      filename += `-${values.fileLigandPDB.name.split(".")[0]}`;
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
  }
}
