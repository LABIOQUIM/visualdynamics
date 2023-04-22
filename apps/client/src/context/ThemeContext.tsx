import {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useState
} from "react";
import { parseCookies, setCookie } from "nookies";

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

  useLayoutEffect(() => {
    const cookies = parseCookies();

    const colorSchemeCookie = cookies["visualdynamics-color-scheme"];
    if (colorSchemeCookie) {
      setTheme(colorSchemeCookie as Theme);
    }
  }, []);

  function toggleTheme() {
    setCookie(
      undefined,
      "visualdynamics-color-scheme",
      theme === "light" ? "dark" : "light",
      {
        path: "/",
        maxAge: 60 * 60 * 24 * 31 * 12
      }
    );
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ContextProps => useContext(ThemeContext);
