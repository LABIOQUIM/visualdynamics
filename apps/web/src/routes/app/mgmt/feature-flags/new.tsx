import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FlagForm, type FlagFormValues } from "./-components/FlagForm";
import { useFlagMutations } from "./-components/useFlagMutations";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { type CreateFeatureFlagInput } from "@/mutations/featureFlags";

export const Route = createFileRoute("/app/mgmt/feature-flags/new")({
  component: RouteComponent,
});

function buildVariantsRecord(
  variants: FlagFormValues["variants"],
  type: FlagFormValues["type"],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const { variantKey, variantValue } of variants) {
    if (!variantKey.trim()) continue;
    if (type === "BOOLEAN") result[variantKey] = variantValue === "true";
    else if (type === "NUMBER") result[variantKey] = Number(variantValue);
    else result[variantKey] = variantValue;
  }
  return result;
}

function RouteComponent() {
  const navigate = useNavigate();
  const { createMutation } = useFlagMutations();

  function handleSubmit(values: FlagFormValues) {
    const input: CreateFeatureFlagInput = {
      key: values.key,
      type: values.type,
      enabled: values.enabled,
      defaultVariant: values.defaultVariant,
      variants: buildVariantsRecord(values.variants, values.type),
      ...(values.description ? { description: values.description } : {}),
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
