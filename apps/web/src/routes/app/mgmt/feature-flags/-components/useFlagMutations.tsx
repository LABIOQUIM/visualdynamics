import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createFeatureFlag,
  type CreateFeatureFlagInput,
  deleteFeatureFlag,
  updateFeatureFlag,
  type UpdateFeatureFlagInput,
} from "@/mutations/featureFlags";

function notify(message: string, success: boolean) {
  notifications.show({
    message,
    color: success ? "green" : "red",
    icon: success ? <IconCheck /> : <IconX />,
    withBorder: true,
  });
}

export function useFlagMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["feature-flags"] });

  const createMutation = useMutation({
    mutationFn: (data: CreateFeatureFlagInput) => createFeatureFlag(data),
    onSuccess: () => {
      invalidate();
      notify("Feature flag created", true);
    },
    onError: (e) => notify(e.message, false),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      key,
      data,
    }: {
      key: string;
      data: UpdateFeatureFlagInput;
    }) => updateFeatureFlag(key, data),
    onSuccess: () => {
      invalidate();
      notify("Feature flag updated", true);
    },
    onError: (e) => notify(e.message, false),
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteFeatureFlag(key),
    onSuccess: () => {
      invalidate();
      notify("Feature flag deleted", true);
    },
    onError: (e) => notify(e.message, false),
  });

  return { createMutation, updateMutation, deleteMutation };
}
