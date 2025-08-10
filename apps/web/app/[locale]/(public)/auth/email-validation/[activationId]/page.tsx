import { Text } from "@mantine/core";

import { validateUserEmail } from "@/actions/auth/validateUserEmail";
import { Heading } from "@/components/Heading/Heading";
import { LanderLayout } from "@/components/Lander/Layout";

interface Props {
  params: Promise<{
    activationId: string;
  }>;
}

export default async function AccountActivationPage({ params }: Props) {
  const { activationId } = await params;

  const validationStatus = await validateUserEmail(activationId);

  if (!validationStatus) {
    return null;
  }

  return (
    <LanderLayout>
      <Heading title="Email Validation" />

      <Text>
        Your email was validated and now you can login to use the available
        services.
      </Text>
    </LanderLayout>
  );
}
