"use client";
import { createContext, ReactNode, useContext, useState } from "react";

export type Theme = "light" | "dark";

interface ContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

interface ProviderProps {
  children: ReactNode;
  defaultTheme: Theme;
  toggleThemeCookie: () => Promise<Theme>;
}

const ThemeContext = createContext({} as ContextProps);

export function ThemeProvider({
  children,
  defaultTheme,
  toggleThemeCookie
}: ProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  function toggleTheme() {
    toggleThemeCookie().then(setTheme);
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      <div className={`h-screen ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ContextProps => useContext(ThemeContext);
