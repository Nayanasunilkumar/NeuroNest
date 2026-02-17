import { getUser, logout } from "../utils/auth";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const user = getUser();
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark");
    setDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-indigo-600 dark:bg-slate-900 text-white shadow transition-colors duration-300">
      {/* Left */}
      <div className="text-xl font-bold tracking-wide">NeuroNest</div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Role badge */}
        {user?.role && (
          <span className="px-3 py-1 text-sm rounded-full bg-indigo-800 dark:bg-slate-700 capitalize border border-transparent dark:border-slate-600">
            {user.role.replace("_", " ")}
          </span>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 rounded transition shadow-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
