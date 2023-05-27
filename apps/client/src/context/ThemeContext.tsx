import { createContext, ReactNode, useContext, useState } from "react";
import { setCookie } from "cookies-next";

export type Theme = "light" | "dark";

interface ContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

interface ProviderProps {
  children: ReactNode;
  defaultTheme: Theme;
}

const ThemeContext = createContext({} as ContextProps);

export const themeCookieKey = "VISUALDYNAMICS_THEME";

export function ThemeProvider({ children, defaultTheme }: ProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  function toggleTheme() {
    setCookie(themeCookieKey, theme === "light" ? "dark" : "light", {
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 31 * 12
    });
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ContextProps => useContext(ThemeContext);
