import { Divider } from "@mantine/core";

import { MySimulations } from "@/app/[locale]/app/(home)/_components/MySimulations";
import { Heading } from "@/components/Heading/Heading";
import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

import { NewSimulationButton } from "./_components/NewSimulationButton";
import { SimulationDetails } from "./_components/SimulationDetails";

import classes from "./page.module.css";

export const metadata = {
  title: "My Simulations",
  description: "View and manage your simulations",
};

export default function Page() {
  return (
    <PageLayout className={classes.container}>
      <div className={classes.simulationsContainer}>
        <Heading
          title="My Simulations"
          rightElement={<NewSimulationButton />}
        />
        <MySimulations />
      </div>
      <Divider orientation="vertical" />
      <div className={classes.expandedDetailsContainer}>
        <Heading title="Simulation Expanded Details" />
        <SimulationDetails />
      </div>
    </PageLayout>
  );
}
