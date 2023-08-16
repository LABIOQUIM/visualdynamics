"use client";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState
} from "react";

interface ContextProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<ContextProps>({
  isSidebarOpen: false,
  closeSidebar: () => {},
  toggleSidebar: () => {}
});

export const SidebarProvider = ({ children }: PropsWithChildren) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  const context = useMemo(
    () => ({
      isSidebarOpen,
      closeSidebar,
      toggleSidebar
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSidebarOpen]
  );

  return (
    <SidebarContext.Provider value={context}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): ContextProps => useContext(SidebarContext);
