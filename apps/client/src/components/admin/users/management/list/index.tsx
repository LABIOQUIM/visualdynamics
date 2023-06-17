import { useState } from "react";
import { useDebounce } from "use-debounce";

import { ActiveUserListItem } from "@app/components/admin/users/management/list/item";
import { useActiveUsers } from "@app/components/admin/users/management/useActiveUsers";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { Input } from "@app/components/general/forms/input";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";

export function ActiveUsersList() {
  const { data, isLoading } = useActiveUsers();
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 1000);

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (!data) {
    return <AlertFailedToFetch />;
  }

  const filteredUsers = data.filter(
    (i) =>
      i.username.includes(debouncedSearchFilter) ||
      i.email.includes(debouncedSearchFilter) ||
      i.name?.includes(debouncedSearchFilter)
  );

  return (
    <div className="space-y-4">
      <Input
        value={searchFilter}
        placeholder="username, email, name"
        onChange={(e) => setSearchFilter(e.target.value)}
      />
      <ul className="grid grid-flow-row grid-cols-1 gap-2 lg:grid-cols-2">
        {filteredUsers.map((user) => (
          <ActiveUserListItem
            key={user.id}
            user={user}
          />
        ))}
      </ul>
    </div>
  );
}
