const THEME_KEY = "neuronest_theme";

export const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || "light";
};

export const applyTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.body.classList.toggle("dark", isDark);
};

export const toggleTheme = () => {
  const next = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
};
