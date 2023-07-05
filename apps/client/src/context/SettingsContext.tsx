import { createContext, ReactNode, useContext } from "react";

import { useAppSettings } from "@app/components/admin/app-settings/useAppSettings";

export type Theme = "light" | "dark";

interface ContextProps {
  maintenanceMode: boolean;
}

interface ProviderProps {
  children: ReactNode;
}

const SettingsContext = createContext({} as ContextProps);

export function SettingsProvider({ children }: ProviderProps) {
  const { data } = useAppSettings();

  return (
    <SettingsContext.Provider
      value={{ maintenanceMode: data?.maintenanceMode ?? false }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = (): ContextProps => useContext(SettingsContext);
