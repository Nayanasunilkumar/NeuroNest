import { useState, useEffect, useRef } from "react";
import { getLatestVitals, getVitalsHistory } from "../services/api/vitals";

const VITALS_TIMEOUT_MS = 10000;

const disconnectedVitals = {
  hr: null,
  spo2: null,
  temp: null,
  hr_alert: 0,
  spo2_alert: 0,
  temp_alert: 0,
  signal: "disconnected",
  connected: false,
};

const isFresh = (payload) => {
  if (!payload?.ts) return false;
  const ts = new Date(payload.ts).getTime();
  return Number.isFinite(ts) && Date.now() - ts <= VITALS_TIMEOUT_MS;
};

const sanitizeVitals = (payload, connected = true) => {
  if (!payload) return null;
  const signal = payload.signal || "na";
  if (signal === "no_device") return { ...payload, hr: null, spo2: null, temp: null, hr_alert: 0, spo2_alert: 0, temp_alert: 0, connected: false };
  if (!connected || signal === "disconnected") return { ...payload, ...disconnectedVitals };
  if (signal === "no_finger" || (signal !== "ok" && signal !== "weak")) {
    return { ...payload, hr: null, spo2: null, temp: null, hr_alert: 0, spo2_alert: 0, temp_alert: 0, connected };
  }

  const hr = Number(payload.hr);
  const spo2 = Number(payload.spo2);
  const temp = Number(payload.temp);
  return {
    ...payload,
    connected,
    hr: Number.isFinite(hr) && hr > 0 ? hr : null,
    spo2: Number.isFinite(spo2) && spo2 > 0 ? spo2 : null,
    temp: Number.isFinite(temp) && temp >= 32 ? temp : null,
    hr_alert: Number.isFinite(hr) && hr > 0 ? payload.hr_alert : 0,
    spo2_alert: Number.isFinite(spo2) && spo2 > 0 ? payload.spo2_alert : 0,
    temp_alert: Number.isFinite(temp) && temp >= 32 ? payload.temp_alert : 0,
  };
};

export function useLiveVitals({ patientId, enabled = true } = {}) {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(true);
  const [lastVitalsTimestamp, setLastVitalsTimestamp] = useState(0);
  const timer = useRef();
  const lastVitalsTimestampRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const fetch_ = async () => {
      try {
        const [lat, hist] = await Promise.all([
          getLatestVitals(patientId),
          getVitalsHistory(patientId),
        ]);
        const connected = lat?.connected === true || isFresh(lat);
        const safeLatest = sanitizeVitals(lat, connected);
        setLatest(safeLatest);
        setHistory(connected && Array.isArray(hist) ? hist : []);
        setError(null);

        if (connected) {
          const now = Date.now();
          lastVitalsTimestampRef.current = now;
          setLastVitalsTimestamp(now);
          setIsOffline(false);
        } else {
          lastVitalsTimestampRef.current = 0;
          setLastVitalsTimestamp(0);
          setIsOffline(true);
        }
      } catch (err) {
        setError(err.message);
        setLatest(disconnectedVitals);
        setHistory([]);
        lastVitalsTimestampRef.current = 0;
        setLastVitalsTimestamp(0);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
    timer.current = setInterval(fetch_, 1000);
    return () => clearInterval(timer.current);
  }, [patientId, enabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastSeen = lastVitalsTimestampRef.current;
      if (lastSeen > 0 && Date.now() - lastSeen > VITALS_TIMEOUT_MS) {
        lastVitalsTimestampRef.current = 0;
        setLastVitalsTimestamp(0);
        setLatest(disconnectedVitals);
        setHistory([]);
        setIsOffline(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { latest, history, loading, error, isOffline, lastVitalsTimestamp };
}
