import { createContext } from "preact";
import type { Dispatch, PropsWithChildren } from "preact/compat";
import { type StateUpdater, useContext, useMemo, useState } from "preact/hooks";

export type ImporterUser = {
  createdAt: string;
  updatedAt: string;
  email: string;
  username: string;
  name: string;
  role: string;
};

type ContextProps = {
  users: ImporterUser[];
  setUsers: Dispatch<StateUpdater<ImporterUser[]>>;
};

const ImporterContext = createContext<ContextProps>({
  users: [],
  setUsers() {},
});

export function useUserImporter() {
  return useContext(ImporterContext);
}

export function UserImporterProvider({ children }: PropsWithChildren) {
  const [users, setUsers] = useState<ImporterUser[]>([]);

  const contextValue = useMemo(
    () => ({
      users,
      setUsers,
    }),
    [users],
  );

  return (
    <ImporterContext.Provider value={contextValue}>
      {children}
    </ImporterContext.Provider>
  );
}
