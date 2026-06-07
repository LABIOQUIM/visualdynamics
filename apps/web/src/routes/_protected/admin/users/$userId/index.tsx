import { Button, Select, Stack, TextInput, Title } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { PageLayout } from "@/components/PageLayout";
import { Loader } from "@/components/Loader";
import { authClient } from "@/lib/auth-client";
import { getMgmtUser } from "@/queries/getMgmtUser";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user"]),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/_protected/admin/users/$userId/")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Edit User",
  },
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery(getMgmtUser(userId));

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      const parsedRole = schema.shape.role.safeParse(user.role);
      const role = parsedRole.success ? parsedRole.data : "user";
      reset({
        name: user.name,
        email: user.email,
        role,
      });
    }
  }, [user, reset]);

  async function onSubmit(values: FormValues) {
    const { error } = await authClient.admin.updateUser({
      userId,
      data: values,
    });

    if (error) {
      notifications.show({
        message: error.message ?? "Failed to update user",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    } else {
      notifications.show({
        message: "User updated successfully",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
      void navigate({ to: "/admin/users" });
    }
  }

  if (isLoading || !user) {
    return <Loader />;
  }

  return (
    <PageLayout title={`Edit User: ${user.username}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack maw={480}>
          <TextInput disabled label="Username" value={user.username} />
          <TextInput
            error={errors.name?.message}
            label="Name"
            withAsterisk
            {...register("name")}
          />
          <TextInput
            error={errors.email?.message}
            label="Email"
            withAsterisk
            {...register("email")}
          />
          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <Select
                data={[
                  { value: "admin", label: "Admin" },
                  { value: "user", label: "User" },
                ]}
                error={errors.role?.message}
                label="Role"
                onChange={(val) => onChange(val)}
                value={value}
                withAsterisk
              />
            )}
          />
          <Title order={4}>Security</Title>
          <TextInput
            disabled
            label="Email Verified"
            value={user.emailVerified ? "Yes" : "No"}
          />
          <TextInput
            disabled
            label="2-Factor Enabled"
            value={user.twoFactorEnabled ? "Yes" : "No"}
          />
          <Button.Group>
            <Button type="submit">Save</Button>
            <Button
              color="gray"
              onClick={() => void navigate({ to: "/admin/users" })}
              variant="light"
            >
              Cancel
            </Button>
          </Button.Group>
        </Stack>
      </form>
    </PageLayout>
  );
}
