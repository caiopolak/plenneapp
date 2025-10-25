import React, { createContext, useContext } from "react";
import { useThemes } from "@/hooks/useThemes";

interface ThemeContextValue {
  themes: ReturnType<typeof useThemes>["themes"];
  currentTheme: ReturnType<typeof useThemes>["currentTheme"];
  isDarkMode: ReturnType<typeof useThemes>["isDarkMode"];
  loading: ReturnType<typeof useThemes>["loading"];
  applyTheme: ReturnType<typeof useThemes>["applyTheme"];
  saveTheme: ReturnType<typeof useThemes>["saveTheme"];
  toggleDarkMode: ReturnType<typeof useThemes>["toggleDarkMode"];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Single source of truth for theming across the app
  const theme = useThemes();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
