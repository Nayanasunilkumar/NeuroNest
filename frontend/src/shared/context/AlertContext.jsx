import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchAlerts, acknowledgeAlert } from "../services/api/alertsApi";
import { getSocket, initSocket } from "../services/socket";
import { AUTH_CHANGED_EVENT, isAuthenticated } from "../utils/auth";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authRevision, setAuthRevision] = useState(0);

  const loadAlerts = useCallback(async () => {
    if (!isAuthenticated()) {
      setAlerts([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await fetchAlerts(true);
      setAlerts(data);
      setUnreadCount(data.filter((alert) => !alert.is_acknowledged).length);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  }, []);

  useEffect(() => {
    loadAlerts();

    const handleStorageChange = (e) => {
      if (e.key === "neuronest_token" || e.key === "neuronest_user") {
        setAuthRevision((value) => value + 1);
      }
    };

    const handleAuthChange = () => {
      setAuthRevision((value) => value + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    };
  }, [loadAlerts]);

  useEffect(() => {
    loadAlerts();
  }, [authRevision, loadAlerts]);

  useEffect(() => {
    if (!isAuthenticated()) return undefined;

    const handleNewAlert = (newAlert) => {
      setAlerts((prevAlerts) => {
        if (prevAlerts.some((alert) => alert.id === newAlert.id)) return prevAlerts;

        const updated = [newAlert, ...prevAlerts];
        setUnreadCount(updated.filter((alert) => !alert.is_acknowledged).length);
        return updated;
      });
    };

    const handleAck = (payload) => {
      setAlerts((prevAlerts) => {
        const updated = prevAlerts.map((alert) =>
          alert.id === payload.id
            ? { ...alert, is_acknowledged: true, acknowledged_by: payload.acknowledged_by }
            : alert,
        );
        setUnreadCount(updated.filter((alert) => !alert.is_acknowledged).length);
        return updated;
      });
    };

    const socket = getSocket() || initSocket();
    if (!socket) return undefined;

    socket.on("critical_alert", handleNewAlert);
    socket.on("alert_acknowledged", handleAck);

    return () => {
      socket.off("critical_alert", handleNewAlert);
      socket.off("alert_acknowledged", handleAck);
    };
  }, [authRevision]);

  const markAcknowledged = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_acknowledged: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, markAcknowledged, loadAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
