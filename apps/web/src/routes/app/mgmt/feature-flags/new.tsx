import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FlagForm, type FlagFormValues } from "./-components/FlagForm";
import { useFlagMutations } from "./-components/useFlagMutations";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { type CreateFeatureFlagInput } from "@/mutations/featureFlags";

export const Route = createFileRoute("/app/mgmt/feature-flags/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { createMutation } = useFlagMutations();

  function handleSubmit(values: FlagFormValues) {
    const input: CreateFeatureFlagInput = {
      key: values.key,
      type: values.type,
      enabled: values.enabled,
      defaultVariant: values.defaultVariant,
      variants: JSON.parse(values.variants) as Record<string, unknown>,
      description: values.description || undefined,
    };

    createMutation.mutate(input, {
      onSuccess: () => void navigate({ to: "/app/mgmt/feature-flags" }),
    });
  }

  return (
    <PageLayout>
      <Heading title="New Feature Flag" />
      <FlagForm
        isLoading={createMutation.isPending}
        onCancel={() => void navigate({ to: "/app/mgmt/feature-flags" })}
        onSubmit={handleSubmit}
        submitLabel="Create"
      />
    </PageLayout>
  );
}
