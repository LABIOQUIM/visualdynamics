import { redirect } from "next/navigation";

export const stayOrRedirect = (simulation: Simulation) => {
  if (simulation.status === "QUEUED" || simulation.status === "RUNNING") {
    redirect("/running-simulation");
  }
};
