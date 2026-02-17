// src/utils/auth.js

const TOKEN_KEY = "neuronest_token";
const USER_KEY = "neuronest_user";

/**
 * Save token and user after login
 */
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get JWT token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get logged-in user
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Check authentication
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login";
};
