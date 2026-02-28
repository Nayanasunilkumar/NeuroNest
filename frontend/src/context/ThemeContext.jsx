import React, { createContext, useContext, useState, useEffect } from "react";
import { getTheme, applyTheme } from "../utils/theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getTheme());

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for storage changes in case of multi-tab consistency
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "neuronest_theme") {
        setTheme(e.newValue || "light");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
