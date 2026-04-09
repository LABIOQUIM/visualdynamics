import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FlagForm, type FlagFormValues } from "./-components/FlagForm";
import { useFlagMutations } from "./-components/useFlagMutations";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { type UpdateFeatureFlagInput } from "@/mutations/featureFlags";
import { getFeatureFlags } from "@/queries/getFeatureFlags";

export const Route = createFileRoute("/app/mgmt/feature-flags/$key")({
  component: RouteComponent,
});

function RouteComponent() {
  const { key } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery(getFeatureFlags());
  const { updateMutation } = useFlagMutations();

  const flag = data?.find((f) => f.key === key);

  if (!flag) return null;

  function handleSubmit(values: FlagFormValues) {
    const input: UpdateFeatureFlagInput = {
      enabled: values.enabled,
      defaultVariant: values.defaultVariant,
      variants: JSON.parse(values.variants) as Record<string, unknown>,
      description: values.description || undefined,
    };

    updateMutation.mutate(
      { key, data: input },
      { onSuccess: () => void navigate({ to: "/app/mgmt/feature-flags" }) },
    );
  }

  return (
    <PageLayout>
      <Heading title={`Edit: ${flag.key}`} />
      <FlagForm
        disabledFields={["key", "type"]}
        initialValues={{
          key: flag.key,
          type: flag.type,
          enabled: flag.enabled,
          defaultVariant: flag.defaultVariant,
          variants: JSON.stringify(flag.variants, null, 2),
          description: flag.description ?? "",
        }}
        isLoading={updateMutation.isPending}
        onCancel={() => void navigate({ to: "/app/mgmt/feature-flags" })}
        onSubmit={handleSubmit}
        submitLabel="Save"
      />
    </PageLayout>
  );
}
