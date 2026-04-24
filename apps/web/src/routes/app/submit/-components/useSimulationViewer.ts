import { useEffect, useState } from "react";

import type { SimulationFormValues } from "./schema";

import type { LatestMacromolecules } from "@/queries/latestMacromolecules";

export function useSimulationViewer(
  filePDB: File | undefined,
  ligands: SimulationFormValues["ligands"],
): LatestMacromolecules {
  const [files, setFiles] = useState<LatestMacromolecules>({
    macromolecule: "",
  });

  useEffect(() => {
    if (filePDB instanceof File) {
      filePDB
        .text()
        .then((text) => setFiles((prev) => ({ ...prev, macromolecule: text })));
    } else {
      setFiles((prev) => ({ ...prev, macromolecule: "" }));
    }
  }, [filePDB]);

  useEffect(() => {
    const ligandFiles = (ligands ?? [])
      .map((l) => l?.filePDB)
      .filter((f): f is File => f instanceof File);

    if (ligandFiles.length === 0) {
      setFiles(({ ligandPdbs: _lp, ...rest }) => rest);
      return;
    }

    Promise.all(ligandFiles.map((f) => f.text())).then((texts) =>
      setFiles((prev) => ({ ...prev, ligandPdbs: texts })),
    );
  }, [ligands]);

  return files;
}
