"use client";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { ActiveUserListItem } from "@/app/[locale]/admin/users/ActiveUserListItem";
import { useUsers } from "@/app/[locale]/admin/users/useUsers";
import { Input } from "@/components/Forms/Input";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { Pagination } from "@/components/Pagination";
import { useI18n } from "@/locales/client";

export function ActiveUserList() {
  const t = useI18n();
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 1000);
  const { data, isLoading } = useUsers({
    page,
    toTake: 20,
    searchByIdentifier: debouncedSearchFilter
  });

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchFilter]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!data) {
    return <Spinner />;
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
          autoFocus
          label={t("admin.users.filters.identifier")}
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
