// src/utils/auth.js

const TOKEN_KEY = "neuronest_token";
const USER_KEY = "neuronest_user";
const ACTIVITY_KEY = "neuronest_last_activity";
export const AUTH_CHANGED_EVENT = "neuronest-auth-changed";

const emitAuthChanged = () => {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
};

/**
 * Save token and user after login
 */
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
  emitAuthChanged();
};

export const updateStoredUser = (partial) => {
  const current = getUser();
  if (!current) return null;
  const next = { ...current, ...partial };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  emitAuthChanged();
  return next;
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
  localStorage.removeItem(ACTIVITY_KEY);
  emitAuthChanged();
  window.location.href = "/login";
};
