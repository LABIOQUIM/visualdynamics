import { lazy, Suspense } from "react";

import { Loader } from "@/components/Loader";

import type { LatestMacromolecules } from "@/queries/latestMacromolecules";

const MolViewer = lazy(() => import("@/components/MolViewer"));

interface Props {
  macromolecules?: LatestMacromolecules;
}

export function LazyMolViewer({ macromolecules }: Props) {
  return (
    <Suspense fallback={<Loader />}>
      <MolViewer {...(macromolecules !== undefined ? { macromolecules } : {})} />
    </Suspense>
  );
}
