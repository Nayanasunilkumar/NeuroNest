import { useState } from "react";
import { toggleTheme, getTheme } from "../utils/theme";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getTheme());

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return (
    <button
      onClick={handleToggle}
      className="px-3 py-2 rounded-lg text-sm font-medium
                 bg-gray-200 dark:bg-gray-700
                 text-gray-800 dark:text-gray-100
                 hover:scale-105 transition"
    >
      {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
};

export default ThemeToggle;
