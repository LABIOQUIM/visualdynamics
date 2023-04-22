import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";

// create context

interface IScrollY {
  id: string | null;
  position: number;
}

interface ContextProps {
  isSidebarOpen: boolean;
  scrollY: IScrollY;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  saveScroll: (el: HTMLElement | null) => void;
}

export const SidebarContext = createContext<ContextProps>({
  isSidebarOpen: false,
  scrollY: { id: null, position: 0 },
  closeSidebar: () => {
    return;
  },
  toggleSidebar: () => {
    return;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  saveScroll: (el: HTMLElement | null) => {
    return;
  }
});

interface ISidebarPovider {
  children: React.ReactNode;
}

export const SidebarProvider = ({ children }: ISidebarPovider) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  const defaultScrollY = useMemo(() => {
    return { id: null, position: 0 };
  }, []);

  const storageScrollY = useCallback(() => {
    return JSON.parse(
      localStorage.getItem("sidebarScrollY") || JSON.stringify(defaultScrollY)
    );
  }, [defaultScrollY]);

  const [scrollY, setScrollY] = useState<IScrollY>(
    process.browser ? storageScrollY() : defaultScrollY
  );

  function saveScroll(el: HTMLElement | null) {
    const id = el?.id || null;
    const position = el?.scrollTop || 0;
    setScrollY({ id, position });
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarScrollY", JSON.stringify(scrollY));
    }
  }, [scrollY]);

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const { id, position } = storageScrollY();
      document.getElementById(id)?.scrollTo(0, position);

      if (isSidebarOpen) {
        document.getElementById(id)?.scrollTo(0, position);
      }
    }
  }, [scrollY, storageScrollY, isSidebarOpen]);

  const context = useMemo(
    () => ({
      isSidebarOpen,
      scrollY,
      toggleSidebar,
      closeSidebar,
      saveScroll
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSidebarOpen, scrollY]
  );

  return (
    <SidebarContext.Provider value={context}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): ContextProps => useContext(SidebarContext);
