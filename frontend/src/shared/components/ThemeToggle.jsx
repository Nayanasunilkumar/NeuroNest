import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
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
