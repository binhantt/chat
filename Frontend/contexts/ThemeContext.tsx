"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  setThemeMode: (theme: Theme) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  setThemeMode: () => {},
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined" && window.localStorage.getItem("chatapp.theme") === "dark"
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const html = document.documentElement;
    window.localStorage.setItem("chatapp.theme", theme);
    // Set data-theme attribute for CSS selectors
    html.setAttribute("data-theme", theme);
    html.style.colorScheme = theme;
    // Also set class for broader compatibility
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ setThemeMode: setTheme, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
