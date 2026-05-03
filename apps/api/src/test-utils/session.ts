export function createSession(
  overrides: Partial<{
    user: Partial<{
      id: string;
      username: string;
      role: "admin" | "user";
    }>;
  }> = {},
) {
  return {
    user: {
      id: "user-id",
      username: "user",
      role: "user" as const,
      ...overrides.user,
    },
  };
}
