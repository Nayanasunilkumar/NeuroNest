import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

const ACTIVITY_KEY = "neuronest_last_activity";
const INACTIVITY_LIMIT_MS = 20 * 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
  "pointerdown",
];

const SessionManager = () => {
  const location = useLocation();
  const timeoutRef = useRef(null);
  const lastWriteRef = useRef(0);

  const clearLogoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleLogout = useCallback(() => {
    clearLogoutTimer();

    if (!isAuthenticated()) return;

    const stored = Number(localStorage.getItem(ACTIVITY_KEY) || Date.now());
    const elapsed = Date.now() - stored;
    const remaining = INACTIVITY_LIMIT_MS - elapsed;

    if (remaining <= 0) {
      logout();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      logout();
    }, remaining);
  }, [clearLogoutTimer]);

  const markActivity = useCallback(() => {
    if (!isAuthenticated()) return;

    const now = Date.now();
    if (now - lastWriteRef.current < 1000) return;

    lastWriteRef.current = now;
    localStorage.setItem(ACTIVITY_KEY, String(now));
    scheduleLogout();
  }, [scheduleLogout]);

  useEffect(() => {
    if (!isAuthenticated()) {
      clearLogoutTimer();
      return;
    }

    if (!localStorage.getItem(ACTIVITY_KEY)) {
      localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    }

    scheduleLogout();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      clearLogoutTimer();
    };
  }, [markActivity, scheduleLogout, clearLogoutTimer]);

  useEffect(() => {
    markActivity();
  }, [location.pathname, markActivity]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === ACTIVITY_KEY) {
        scheduleLogout();
      }

      if (event.key === "neuronest_token" && !event.newValue) {
        clearLogoutTimer();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [scheduleLogout, clearLogoutTimer]);

  return null;
};

export default SessionManager;
