import classes from "./ExecutionProgress.module.css";

import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFolderOff, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Log } from "./Log";
import { RefetchTime } from "./RefetchTime";
import { Steps } from "./Steps";

import { StatusBadge } from "@/components/StatusBadge";
import { cancelSimulation } from "@/mutations/cancelSimulation";
import { getSimulation } from "@/queries/getSimulation";
import { QUERY_KEYS } from "@/lib/queryKeys";

type ExecutionProgressProps = {
  simulationId: string;
};

export function ExecutionProgress({ simulationId }: ExecutionProgressProps) {
  const queryClient = useQueryClient();
  const { data } = useQuery(getSimulation(simulationId));
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { mutate: cancel, isPending: isCanceling } = useMutation({
    mutationFn: () => cancelSimulation(simulationId),
    onSuccess: () => {
      notifications.show({
        title: "Simulation canceled",
        message: "The simulation has been successfully canceled.",
        color: "orange",
        withBorder: true,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.simulation(simulationId),
      });
      setCancelModalOpen(false);
    },
    onError: () => {
      notifications.show({
        title: "Failed to cancel",
        message: "Could not cancel the simulation. Please try again.",
        color: "red",
        withBorder: true,
      });
    },
  });

  if (!data) {
    return <Loader />;
  }

  const isQueued = data.simulation.status === "QUEUED";
  const isRunning = data.simulation.status === "RUNNING";
  const canCancel = isQueued || isRunning;

  const cancelButton = canCancel ? (
    <Button
      color="red"
      leftSection={<IconX size="1rem" />}
      loading={isCanceling}
      onClick={() => setCancelModalOpen(true)}
      variant="light"
    >
      Cancel Simulation
    </Button>
  ) : null;

  const confirmModal = (
    <Modal
      centered
      onClose={() => setCancelModalOpen(false)}
      opened={cancelModalOpen}
      title="Cancel this simulation?"
    >
      <Stack>
        <Alert
          color="orange"
          title="This action cannot be undone"
          variant="light"
        >
          The simulation will be stopped immediately and cannot be resumed. Any
          completed steps will be preserved.
        </Alert>
        <Group justify="flex-end">
          <Button
            color="gray"
            onClick={() => setCancelModalOpen(false)}
            variant="subtle"
          >
            Go back
          </Button>
          <Button
            color="red"
            loading={isCanceling}
            onClick={() => cancel()}
          >
            Yes, cancel simulation
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  if (!data.isStored) {
    return (
      <>
        <Box className={classes.noLogsContainer}>
          <IconFolderOff size={64} />
          <Text size="lg">
            This simulation is not stored anymore. Execution info is
            unavailable.
          </Text>
        </Box>
        {confirmModal}
      </>
    );
  }

  if (isQueued) {
    return (
      <>
        <Box className={classes.noLogsContainer}>
          <StatusBadge status="QUEUED" />
          <Text size="lg">
            Your simulation is in the queue (position: {data.queuePosition})
          </Text>
          <RefetchTime />
          {cancelButton}
        </Box>
        {confirmModal}
      </>
    );
  }

  if (data.simulation.status === "GENERATED") {
    return (
      <>
        <Box className={classes.noLogsContainer}>
          <StatusBadge status="GENERATED" />
          <Text size="lg">
            This simulation has been created but has not been queued for
            execution yet.
          </Text>
        </Box>
        {confirmModal}
      </>
    );
  }

  if (data.simulation.status === "CANCELED") {
    return (
      <>
        <Box className={classes.noLogsContainer}>
          <StatusBadge status="CANCELED" />
          <Text size="lg">This simulation was canceled.</Text>
        </Box>
        {confirmModal}
      </>
    );
  }

  if (data.simulation.status === "ERRORED") {
    return (
      <>
        <Box className={classes.noLogsContainer}>
          <StatusBadge status="ERRORED" />
          <Text size="lg">
            This simulation encountered an error during execution.
          </Text>
          {data.simulation.errorCause && (
            <Text c="dimmed" size="sm">
              {data.simulation.errorCause}
            </Text>
          )}
        </Box>
        {confirmModal}
      </>
    );
  }

  return (
    <>
      <Box className={classes.container}>
        <Steps isSimulationRunning={data.isActive} stepsDone={data.stepData} />
        <Log logs={data.logData} />
      </Box>
      {cancelButton}
      {confirmModal}
    </>
  );
}
