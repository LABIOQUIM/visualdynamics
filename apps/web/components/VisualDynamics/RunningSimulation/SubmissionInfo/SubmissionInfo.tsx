"use client";
import { Fragment } from "react";
import { Box, Text } from "@mantine/core";

import { useSimulation } from "@/hooks/simulation/useSimulation";
import { useSettings } from "@/hooks/utils/useSettings";
import { dateFormat } from "@/utils/dateFormat";

import classes from "./SubmissionInfo.module.css";

function InfoText({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <Box className={classes.text_container}>
      <Text fw="bold" size="xl">
        {label}:
      </Text>
      <Text size="xl">{value}</Text>
    </Box>
  );
}

interface Props {
  simulationId: string;
}

export function SubmissionInfo({ simulationId }: Props) {
  const { data, isError, isLoading } = useSimulation(simulationId);
  const { data: settings } = useSettings("visualdynamics");

  if (
    !data ||
    isLoading ||
    settings === "error" ||
    settings === "unauthenticated" ||
    settings?.systemMode !== "ACTIVE"
  ) {
    return null;
  }

  if (data === "unauthenticated" || isError) {
    return "failed";
  }

  if (data.status === "not-running" || data.status === "queued") {
    return null;
  }

  return (
    <Box className={classes.container}>
      <InfoText label="Simulation Type" value={data.submissionInfo.type} />
      <InfoText
        label="Molecule name"
        value={data.submissionInfo.moleculeName}
      />
      {data.submissionInfo.type === "acpype" && (
        <Fragment>
          <InfoText
            label="Ligand ITP name"
            value={data.submissionInfo.ligandITPName}
          />
          <InfoText
            label="Ligand PDB name"
            value={data.submissionInfo.ligandPDBName}
          />
        </Fragment>
      )}
      <InfoText
        label="Started at"
        value={dateFormat(data.submissionInfo.startedAt)}
      />
      <InfoText
        label="Submitted at"
        value={dateFormat(data.submissionInfo.createdAt)}
      />
    </Box>
  );
}
