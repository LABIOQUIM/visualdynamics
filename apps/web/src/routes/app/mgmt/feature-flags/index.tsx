import classes from "./feature-flags.module.css";

import { useMemo, useState } from "react";
import { Group, Pagination, Select, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { FlagCard } from "./-components/FlagCard";
import { useFlagMutations } from "./-components/useFlagMutations";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";
import { ButtonLink } from "@/components/RouterComponents";
import { getFeatureFlags } from "@/queries/getFeatureFlags";

const PAGE_SIZE_OPTIONS = [
  { value: "12", label: "12 / page" },
  { value: "24", label: "24 / page" },
  { value: "48", label: "48 / page" },
];

export const Route = createFileRoute("/app/mgmt/feature-flags/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data = [] } = useQuery(getFeatureFlags());
  const { deleteMutation } = useFlagMutations();

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (f) =>
        f.key.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function handleSearch(q: string) {
    setSearch(q);
    setPage(1);
  }

  function handlePageSize(v: string | null) {
    if (!v) return;
    setPageSize(Number(v));
    setPage(1);
  }

  return (
    <PageLayout>
      <Heading
        rightElement={
          <ButtonLink
            leftSection={<IconPlus size={16} />}
            size="sm"
            to="/app/mgmt/feature-flags/new"
          >
            New Flag
          </ButtonLink>
        }
        title="Feature Flags"
      />

      <Group mb="md">
        <TextInput
          leftSection={<IconSearch size={14} />}
          onChange={(e) => handleSearch(e.currentTarget.value)}
          placeholder="Search flags…"
          style={{ flex: 1 }}
          value={search}
        />
        <Select
          data={PAGE_SIZE_OPTIONS}
          onChange={handlePageSize}
          style={{ width: 130 }}
          value={String(pageSize)}
          withCheckIcon={false}
        />
      </Group>

      {filtered.length === 0 ? (
        <Text c="dimmed">
          {search
            ? "No flags match your search."
            : "No feature flags configured yet."}
        </Text>
      ) : (
        <>
          <div
            className={classes.grid}
            style={{ marginBottom: "var(--mantine-spacing-md)" }}
          >
            {paginated.map((flag) => (
              <FlagCard
                flag={flag}
                isDeleting={deleteMutation.isPending}
                key={flag.id}
                onDelete={() => deleteMutation.mutate(flag.key)}
              />
            ))}
          </div>

          <Group justify="space-between">
            <Text c="dimmed" size="sm">
              {filtered.length} flag{filtered.length !== 1 ? "s" : ""}
              {search ? " found" : " total"}
            </Text>
            <Pagination
              onChange={setPage}
              total={totalPages}
              value={safePage}
            />
          </Group>
        </>
      )}
    </PageLayout>
  );
}
