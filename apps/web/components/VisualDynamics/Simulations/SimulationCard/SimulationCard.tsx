"use client";
import { Fragment } from "react";
import { Box, Card, Text, Title } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Simulation, SIMULATION_TYPE } from "database";
import Link from "next/link";

import { Alert } from "@/components/Alerts/Alert";
import { dateFormat } from "@/utils/dateFormat";

import { Download } from "./Download";

import classes from "./SimulationCard.module.css";

interface Props {
  simulation: Simulation | null;
  type: SIMULATION_TYPE;
}

interface LineProps {
  label: string;
  value?: string | null;
}

function Line({ label, value }: LineProps) {
  if (!value) {
    return null;
  }

  return (
    <Box className={classes.line_info}>
      <Text className={classes.line_info_label}>{label}:</Text>
      <Text className={classes.line_info_value}>{value}</Text>
    </Box>
  );
}

export function SimulationCard({ simulation, type }: Props) {
  const background = clsx({
    [classes.queued]: simulation?.status === "QUEUED",
    [classes.errored]: simulation?.status === "ERRORED",
    [classes.running]: simulation?.status === "RUNNING",
    [classes.completed]: simulation?.status === "COMPLETED",
  });

  const border = clsx({
    [classes.queued_border]: simulation?.status === "QUEUED",
    [classes.errored_border]: simulation?.status === "ERRORED",
    [classes.running_border]: simulation?.status === "RUNNING",
    [classes.completed_border]: simulation?.status === "COMPLETED",
  });

  const title = {
    apo: "Free Protein (APO)",
    acpype: "Protein + Ligand (prepared in ACPYPE)",
  };

  return (
    <Card
      component={simulation?.status === "RUNNING" ? Link : undefined}
      href="/dashboard/simulations/running"
      className={clsx(classes.default, background, border)}
      withBorder
    >
      <Card.Section className={border} withBorder>
        <Title className={classes.title}>{title[type]}</Title>
      </Card.Section>
      {simulation ? (
        <Fragment>
          <Box className={classes.section_info_container}>
            <Title className={classes.section_title}>Simulation Info</Title>
            <Box>
              <Line label="Macromolecule" value={simulation?.moleculeName} />
              <Line label="Ligand ITP" value={simulation?.ligandITPName} />
              <Line label="Ligand PDB" value={simulation?.ligandPDBName} />
              <Line
                label="Submitted in"
                value={dateFormat(simulation?.createdAt)}
              />
              <Line
                label="Started at"
                value={dateFormat(simulation?.startedAt)}
              />
              <Line label="Ended at" value={dateFormat(simulation?.endedAt)} />
              {simulation.errorCause && (
                <Alert
                  mt="xs"
                  status={{
                    status: "error",
                    title: "Error cause",
                    message: simulation.errorCause,
                  }}
                />
              )}
            </Box>
          </Box>
          <Box className={classes.download_section_container}>
            <Title className={classes.section_title}>Downloads</Title>
            {simulation?.status === "COMPLETED" ||
            simulation?.status === "ERRORED" ? (
              <Box className={classes.section_container}>
                <Download simulation={simulation} target="commands" />
                <Download simulation={simulation} target="figures" />
                <Download simulation={simulation} target="gromacsLogs" />
                <Download simulation={simulation} target="results" />
              </Box>
            ) : (
              <Text>Downloads will be available when the simulation ends.</Text>
            )}
          </Box>
        </Fragment>
      ) : (
        <Box className={classes.no_simulation_container}>
          <IconInfoCircle size={64} />
          <Title order={3}>No simulation yet.</Title>
          <Text>You can always start a new simulation in the sidebar.</Text>
        </Box>
      )}
    </Card>
  );
}
