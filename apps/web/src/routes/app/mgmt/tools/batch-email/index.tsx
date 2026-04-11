import classes from "./batch-email.module.css";

import { useState } from "react";
import { Grid, Paper } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ComposePanel } from "./-components/ComposePanel";
import { RecipientPicker } from "./-components/RecipientPicker";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { fetchMgmtUsers, getMgmtUsers } from "@/queries/getMgmtUsers";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/app/mgmt/tools/batch-email/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const columnFilters = debouncedSearch
    ? [{ id: "email", value: debouncedSearch }]
    : [];

  const { data, isLoading, isError, error } = useQuery(
    getMgmtUsers({
      pagination: { pageIndex, pageSize: PAGE_SIZE },
      columnFilters,
    }),
  );

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPageIndex(0);
  }

  function toggleUser(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  }

  const [isSelectingAll, setIsSelectingAll] = useState(false);

  async function toggleAll() {
    const allSelected = selected.size >= total && total > 0;
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setIsSelectingAll(true);
    try {
      const result = await fetchMgmtUsers({ columnFilters });
      const allEmails = (result?.users ?? []).map((u) => u.email);
      setSelected(new Set(allEmails));
    } finally {
      setIsSelectingAll(false);
    }
  }

  return (
    <PageLayout>
      <Heading title="Batch Email" />

      <Grid
        align="stretch"
        className={classes.grid}
        classNames={{ inner: classes.gridInner }}
      >
        <Grid.Col className={classes.col} span={{ base: 12, md: 5 }}>
          <Paper className={classes.paper} p="md" withBorder>
            <RecipientPicker
              error={error}
              isError={isError}
              isLoading={isLoading}
              isSelectingAll={isSelectingAll}
              onPageChange={setPageIndex}
              onSearchChange={handleSearchChange}
              onToggleAll={toggleAll}
              onToggleUser={toggleUser}
              page={pageIndex}
              pageSize={PAGE_SIZE}
              search={search}
              selected={selected}
              total={total}
              users={users}
            />
          </Paper>
        </Grid.Col>

        <Grid.Col className={classes.col} span={{ base: 12, md: 7 }}>
          <ComposePanel
            onSuccess={() => setSelected(new Set())}
            selected={selected}
          />
        </Grid.Col>
      </Grid>
    </PageLayout>
  );
}
