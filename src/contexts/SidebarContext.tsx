"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem("scb_sidebar_collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("scb_sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const setMobileOpen = (open: boolean) => setIsMobileOpen(open);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, isMobileOpen, toggleCollapse, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
