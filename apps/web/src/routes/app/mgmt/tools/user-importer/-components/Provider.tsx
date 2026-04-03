import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

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
  setUsers: Dispatch<SetStateAction<ImporterUser[]>>;
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
