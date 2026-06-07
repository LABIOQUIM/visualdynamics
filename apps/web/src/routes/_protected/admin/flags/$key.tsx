import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FlagForm, type FlagFormValues } from "./-components/FlagForm";
import { useFlagMutations } from "./-components/useFlagMutations";

import { PageLayout } from "@/components/PageLayout";
import { type UpdateFeatureFlagInput } from "@/mutations/featureFlags";
import { getFeatureFlags } from "@/queries/getFeatureFlags";

export const Route = createFileRoute("/_protected/admin/flags/$key")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const flags = await context.queryClient.ensureQueryData(getFeatureFlags());
    const flag = flags.find((f) => f.key === params.key);
    return { key: flag?.key };
  },
  staticData: {
    breadcrumb: ({ loaderData }) => loaderData?.key ?? "...",
  },
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
  const { key } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery(getFeatureFlags());
  const { updateMutation } = useFlagMutations();

  const flag = data?.find((f) => f.key === key);

  if (!flag) return null;

  const variantEntries: FlagFormValues["variants"] = Object.entries(
    flag.variants ?? {},
  ).map(([k, v]) => ({ variantKey: k, variantValue: String(v) }));

  function handleSubmit(values: FlagFormValues) {
    const input: UpdateFeatureFlagInput = {
      enabled: values.enabled,
      defaultVariant: values.defaultVariant,
      variants: buildVariantsRecord(values.variants, values.type),
      ...(values.description ? { description: values.description } : {}),
    };

    updateMutation.mutate(
      { key, data: input },
      { onSuccess: () => void navigate({ to: "/admin/flags" }) },
    );
  }

  return (
    <PageLayout title={`Edit: ${flag.key}`}>
      <FlagForm
        disabledFields={["key", "type"]}
        initialValues={{
          key: flag.key,
          type: flag.type,
          enabled: flag.enabled,
          defaultVariant: flag.defaultVariant,
          variants: variantEntries,
          description: flag.description ?? "",
        }}
        isLoading={updateMutation.isPending}
        onCancel={() => void navigate({ to: "/admin/flags" })}
        onSubmit={handleSubmit}
        submitLabel="Save"
      />
    </PageLayout>
  );
}
