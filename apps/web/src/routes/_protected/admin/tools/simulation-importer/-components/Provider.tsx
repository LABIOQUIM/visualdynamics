import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type ImporterSimulation = {
  id: string;
  user_id: string;
  molecule_name: string;
  type: string;
  status: string;
  started_at: string;
  ended_at: string;
  error_cause: string;
  created_at: string;
  updated_at: string;
  ligand_itp_name: string;
  ligand_pdb_name: string;
};

export type ImporterUserRow = {
  id: string;
  user_name: string;
  email: string;
  first_name: string;
  last_name: string;
};

type ContextProps = {
  simulations: ImporterSimulation[];
  setSimulations: Dispatch<SetStateAction<ImporterSimulation[]>>;
  users: ImporterUserRow[];
  setUsers: Dispatch<SetStateAction<ImporterUserRow[]>>;
};

const ImporterContext = createContext<ContextProps>({
  simulations: [],
  setSimulations() {},
  users: [],
  setUsers() {},
});

export function useSimulationImporter() {
  return useContext(ImporterContext);
}

export function SimulationImporterProvider({ children }: PropsWithChildren) {
  const [simulations, setSimulations] = useState<ImporterSimulation[]>([]);
  const [users, setUsers] = useState<ImporterUserRow[]>([]);

  const contextValue = useMemo(
    () => ({ simulations, setSimulations, users, setUsers }),
    [simulations, users],
  );

  return (
    <ImporterContext.Provider value={contextValue}>
      {children}
    </ImporterContext.Provider>
  );
}
