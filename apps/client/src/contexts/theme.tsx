import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { parseCookies, setCookie } from "nookies";

export type Theme = "amber" | "stone" | "green" | "indigo" | "violet" | "rose";

interface ContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface ProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext({} as ContextProps);

export function ThemeProvider({ children }: ProviderProps) {
  const [theme, setTheme] = useState<Theme>("green");

  useEffect(() => {
    const cookies = parseCookies();

    const colorSchemeCookie = cookies["visuldynamics-color-scheme"];
    if (colorSchemeCookie) {
      setTheme(colorSchemeCookie as Theme);
    }
  }, []);

  function changeTheme(newTheme: Theme) {
    setCookie(undefined, "visualdynamics-color-scheme", newTheme, {
      path: "/"
    });
    setTheme(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ setTheme: changeTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ContextProps => useContext(ThemeContext);
