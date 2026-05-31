type MaybeAuthSession = {
  session?: unknown;
  user?: {
    role?: string | null | undefined;
  } | null;
} | null | undefined;

export function hasCompleteAuthSession(data: MaybeAuthSession) {
  return Boolean(data?.session && data.user);
}

export function isAdminSession(data: MaybeAuthSession) {
  return hasCompleteAuthSession(data) && data?.user?.role === "admin";
}
