import { useState, useEffect, useRef } from "react";
import { getLatestVitals, getVitalsHistory } from "../services/api/vitals";

export function useLiveVitals({ patientId, enabled = true } = {}) {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(true);
  const timer = useRef();

  useEffect(() => {
    if (!enabled) return;

    const fetch_ = async () => {
      try {
        const [lat, hist] = await Promise.all([
          getLatestVitals(patientId),
          getVitalsHistory(patientId),
        ]);
        setLatest(lat);
        setHistory(hist);
        setError(null);

        if (lat && lat.ts) {
          const diff = Date.now() - new Date(lat.ts).getTime();
          setIsOffline(diff > 15000); // 15s threshold
        } else {
          setIsOffline(true);
        }
      } catch (err) {
        setError(err.message);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
    timer.current = setInterval(fetch_, 1000);
    return () => clearInterval(timer.current);
  }, [patientId, enabled]);

  return { latest, history, loading, error, isOffline };
}
