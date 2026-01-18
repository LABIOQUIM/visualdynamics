import classes from "./index.module.css";

import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { Heading } from "@/components/Heading";
import { MySimulations } from "@/components/MySimulations";
import { PageLayout } from "@/components/PageLayout";
import { SimulationDetails } from "@/components/SimulationDetails";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout>
      <Heading title="My Simulations" />

      <Box className={classes.container}>
        <MySimulations />
        <SimulationDetails />
      </Box>
    </PageLayout>
  );
}
