import { SimpleGrid, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { FlagCard } from "./-components/FlagCard";
import { useFlagMutations } from "./-components/useFlagMutations";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { ButtonLink } from "@/components/RouterComponents";
import { getFeatureFlags } from "@/queries/getFeatureFlags";

export const Route = createFileRoute("/app/mgmt/feature-flags/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data = [] } = useQuery(getFeatureFlags());
  const { deleteMutation } = useFlagMutations();

  return (
    <PageLayout>
      <Heading
        rightElement={
          <ButtonLink
            leftSection={<IconPlus size={16} />}
            size="sm"
            to="/app/mgmt/feature-flags/new"
          >
            New Flag
          </ButtonLink>
        }
        title="Feature Flags"
      />
      {data.length === 0 ? (
        <Text c="dimmed">No feature flags configured yet.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {data.map((flag) => (
            <FlagCard
              flag={flag}
              isDeleting={deleteMutation.isPending}
              key={flag.id}
              onDelete={() => deleteMutation.mutate(flag.key)}
            />
          ))}
        </SimpleGrid>
      )}
    </PageLayout>
  );
}
