import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { getCookie, hasCookie, setCookie } from "cookies-next";

export type Theme = "light" | "dark";

interface ContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

interface ProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext({} as ContextProps);

export function ThemeProvider({ children }: ProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const themeCookieKey = "VISUALDYNAMICS_THEME";

  useEffect(() => {
    if (hasCookie(themeCookieKey)) {
      setTheme(getCookie(themeCookieKey) as Theme);
    }
  }, []);

  function toggleTheme() {
    setCookie(themeCookieKey, theme === "light" ? "dark" : "light", {
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
