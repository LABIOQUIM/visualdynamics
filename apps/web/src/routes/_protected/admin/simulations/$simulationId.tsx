import { Button, Group, Select, Stack, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";

import { PageLayout } from "@/components/PageLayout";
import {
  updateSimulation,
  type UpdateSimulationInput,
} from "@/mutations/updateSimulation";
import { getSimulation } from "@/queries/getSimulation";

const STATUS_OPTIONS = [
  { value: "QUEUED", label: "Queued" },
  { value: "RUNNING", label: "Running" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
  { value: "ERRORED", label: "Errored" },
  { value: "GENERATED", label: "Generated" },
];

const TYPE_OPTIONS = [
  { value: "apo", label: "Apo" },
  { value: "acpype", label: "Acpype" },
];

export const Route = createFileRoute(
  "/_protected/admin/simulations/$simulationId",
)({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Edit Simulation",
  },
});

function RouteComponent() {
  const { simulationId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(getSimulation(simulationId));

  const simulation = data?.simulation;

  const { control, handleSubmit, register } = useForm<UpdateSimulationInput>({
    values: {
      moleculeName: simulation?.moleculeName,
      type: simulation?.type,
      status: simulation?.status,
      errorCause: simulation?.errorCause,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateSimulationInput) =>
      updateSimulation(simulationId, values),
    onSuccess: () => {
      notifications.show({
        message: "Simulation updated",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
      queryClient.invalidateQueries({ queryKey: ["mgmt-simulations"] });
      void navigate({ to: "/admin/simulations" });
    },
    onError: (e) => {
      notifications.show({
        message: e.message,
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    },
  });

  if (isLoading || !simulation) return null;

  return (
    <PageLayout title="Edit Simulation">
      <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))}>
        <Stack>
          <Title order={5}>Simulation Info</Title>
          <TextInput label="Macromolecule" {...register("moleculeName")} />
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Select
                data={TYPE_OPTIONS}
                label="Type"
                onChange={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => (
              <Select
                data={STATUS_OPTIONS}
                label="Status"
                onChange={onChange}
                value={value}
              />
            )}
          />
          <TextInput label="Error Cause" {...register("errorCause")} />
          <Group mt="md">
            <Button loading={updateMutation.isPending} type="submit">
              Save
            </Button>
            <Button
              onClick={() => void navigate({ to: "/admin/simulations" })}
              variant="subtle"
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
    </PageLayout>
  );
}
