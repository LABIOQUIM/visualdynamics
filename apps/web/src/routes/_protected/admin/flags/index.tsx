import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { FlagTable } from "./-components/FlagTable";
import { useFlagMutations } from "./-components/useFlagMutations";

import { PageLayout } from "@/components/PageLayout";
import { ButtonLink } from "@/components/RouterComponents";
import { getFeatureFlags } from "@/queries/getFeatureFlags";

export const Route = createFileRoute("/_protected/admin/flags/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data = [] } = useQuery(getFeatureFlags());
  const { deleteMutation } = useFlagMutations();

  return (
    <PageLayout
      rightElement={
        <ButtonLink
          leftSection={<IconPlus size={16} />}
          size="sm"
          to="/admin/flags/new"
        >
          New Flag
        </ButtonLink>
      }
      title="Feature Flags"
    >
      <FlagTable
        data={data}
        isDeleting={deleteMutation.isPending}
        onDelete={(key) => deleteMutation.mutate(key)}
      />
    </PageLayout>
  );
}
