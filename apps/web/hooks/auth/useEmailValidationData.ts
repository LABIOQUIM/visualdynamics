import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import {
  EmailValidationData,
  getEmailValidationData,
} from "@/actions/auth/getEmailValidationData";

export function useEmailValidationData(
  validationCode: string | null,
  options?: UseQueryOptions<EmailValidationData | null, unknown>
): UseQueryResult<EmailValidationData | null, unknown> {
  return useQuery({
    queryKey: ["email-validation-data", validationCode],
    queryFn: () => getEmailValidationData(validationCode),
    ...options,
  });
}
