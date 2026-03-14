import { useEffect, useMemo, useState } from "react";
import { getLatestVitals, getVitalsHistory } from "../api/vitals";
import { getUser } from "../utils/auth";
import { getSocket, initSocket } from "../services/socket";

const normalizeHistory = (rows = []) =>
  rows.map((row) => ({
    ...row,
    temp: row.temperature,
    hr: row.heart_rate,
  }));

export const useLiveVitals = ({ patientId = null, enabled = true } = {}) => {
  const currentUser = getUser();
  const resolvedPatientId = useMemo(() => {
    if (patientId) return patientId;
    if (currentUser?.role === "patient") return currentUser.id;
    return null;
  }, [patientId, currentUser]);

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !resolvedPatientId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [latestPayload, historyPayload] = await Promise.all([
          getLatestVitals(resolvedPatientId),
          getVitalsHistory(resolvedPatientId, 60),
        ]);
        if (cancelled) return;
        setLatest(latestPayload || null);
        setHistory(normalizeHistory(historyPayload || []));
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Failed to load live vitals");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, resolvedPatientId]);

  useEffect(() => {
    if (!enabled || !resolvedPatientId) return undefined;

    const socket = initSocket() || getSocket();
    if (!socket) return undefined;

    const handleVitalsUpdate = (payload) => {
      if (String(payload?.patient_id) !== String(resolvedPatientId)) return;
      setLatest(payload);
      setHistory((prev) => {
        const next = [
          ...prev,
          {
            ...payload,
            temp: payload.temperature,
            hr: payload.heart_rate,
            recorded_timestamp: payload.recorded_timestamp || new Date().toISOString(),
          },
        ];
        return next.slice(-60);
      });
    };

    socket.emit("join_vitals_room", { patient_id: resolvedPatientId });
    socket.on("vitals_update", handleVitalsUpdate);

    return () => {
      socket.emit("leave_vitals_room", { patient_id: resolvedPatientId });
      socket.off("vitals_update", handleVitalsUpdate);
    };
  }, [enabled, resolvedPatientId]);

  return {
    latest,
    history,
    loading,
    error,
    patientId: resolvedPatientId,
  };
};
