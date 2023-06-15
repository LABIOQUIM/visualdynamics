import { ActiveUserListItem } from "@app/components/admin/users/management/list/item";
import { useActiveUsers } from "@app/components/admin/users/management/useActiveUsers";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";

export function ActiveUsersList() {
  const { data, isLoading } = useActiveUsers();

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (!data) {
    return <AlertFailedToFetch />;
  }

  return (
    <ul className="grid grid-flow-row grid-cols-2 gap-2">
      {data.map((user) => (
        <ActiveUserListItem
          key={user.id}
          user={user}
        />
      ))}
    </ul>
  );
}
