import { PasswordResetForm } from "@/components/Auth/PasswordReset/PasswordResetForm";
import { Heading } from "@/components/Heading/Heading";
import { LanderLayout } from "@/components/Lander/Layout";

interface Props {
  params: Promise<{
    resetId: string;
  }>;
}

export default async function AccountActivationPage({ params }: Props) {
  const { resetId } = await params;

  if (!resetId) {
    return null;
  }

  return (
    <LanderLayout>
      <Heading title="Password Reset" />

      <PasswordResetForm resetId={resetId} />
    </LanderLayout>
  );
}
