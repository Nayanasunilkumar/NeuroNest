import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchAlerts, acknowledgeAlert } from "../api/alertsApi";
import { getSocket } from "../services/socket";
import { isAuthenticated } from "../utils/auth";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadAlerts = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const data = await fetchAlerts(true);
      setAlerts(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    
    // Set up polling auth event or just load once on mount
    const handleStorageChange = (e) => {
      if (e.key === "neuronest_token" && !!e.newValue) {
        loadAlerts();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadAlerts]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const handleNewAlert = (newAlert) => {
      setAlerts((prev) => {
        if (prev.some(a => a.id === newAlert.id)) return prev;
        const updated = [newAlert, ...prev];
        setUnreadCount(updated.filter(a => !a.is_acknowledged).length);
        return updated;
      });
    };

    const handleAck = (data) => {
      setAlerts((prev) => {
        const updated = prev.map(a => a.id === data.id ? { ...a, is_acknowledged: true, acknowledged_by: data.acknowledged_by } : a);
        setUnreadCount(updated.filter(a => !a.is_acknowledged).length);
        return updated;
      });
    };

    const socket = getSocket();
    if (socket) {
      socket.on("critical_alert", handleNewAlert);
      socket.on("alert_acknowledged", handleAck);

      return () => {
        socket.off("critical_alert", handleNewAlert);
        socket.off("alert_acknowledged", handleAck);
      };
    }
  }, []);

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
