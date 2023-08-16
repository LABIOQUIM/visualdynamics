import { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { useDebounce } from "use-debounce";

import { ActiveUserListItem } from "aold/components/admin/users/management/list/item";
import { useActiveUsers } from "aold/components/admin/users/management/useActiveUsers";
import { AlertFailedToFetch } from "aold/components/general/alerts/failed-to-fetch";
import { Input } from "aold/components/general/forms/input";
import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { Pagination } from "aold/components/general/pagination";

export function ActiveUsersList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 1000);
  const { data, isLoading } = useActiveUsers(page, debouncedSearchFilter);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchFilter]);

  if (isLoading) {
    return <PageLoadingIndicator />;
  }

  if (!data) {
    return <AlertFailedToFetch />;
  }

  return (
    <div className="space-y-4">
      <Pagination
        onPageChange={(page) => setPage(page)}
        totalRegisterCount={data.count}
        currentPage={page}
        registersPerPage={20}
      />
      <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-2">
        <Input
          label={t("admin-users:filters.identifier")}
          value={searchFilter}
          placeholder="e.g.: admin, admin@fiocruz.br, John Doe"
          onChange={(e) => setSearchFilter(e.target.value)}
        />
      </div>
      <ul className="grid grid-flow-row grid-cols-1 gap-2 md:grid-cols-2">
        {data.users.map((user) => (
          <ActiveUserListItem
            key={user.id}
            user={user}
          />
        ))}
      </ul>
    </div>
  );
}
