"use server";

import { serverApi } from "@/lib/api";

export async function createNewACPYPESimulation(
  data: NewACPYPESimulationProps,
  formDataWithFile: FormData
) {
  formDataWithFile.append("force_field", data.forceField);
  formDataWithFile.append("water_model", data.waterModel);
  formDataWithFile.append("box_type", data.boxType);
  formDataWithFile.append("box_distance", data.boxDistance);
  formDataWithFile.append("bootstrap", data.bootstrap ? "true" : "false");
  formDataWithFile.append("neutralize", data.neutralize ? "true" : "false");
  formDataWithFile.append("double", data.double ? "true" : "false");
  formDataWithFile.append("ignore", data.ignore ? "true" : "false");
  formDataWithFile.append("username", data.username);

  const { data: response } = await serverApi.post(
    "/generate/acpype",
    formDataWithFile,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  // TODO: Create new Simulation on database, be it a commands download or a server run

  if (response.status === "generated") {
    const { data: runResponse } = await serverApi.post(
      "/run",
      {
        folder: response.folder,
        email: data.user_email
      },
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    if (
      runResponse.status === "running-or-queued" ||
      runResponse.status === "queued"
    ) {
      return "simulation-started";
    }
  } else if (response.status === "commands") {
    return response.commands.join("");
  }
}
