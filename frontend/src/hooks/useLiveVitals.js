import { useState, useEffect, useRef } from "react";
import { getLatestVitals, getVitalsHistory } from "../api/vitals";

export function useLiveVitals({ patientId, enabled = true } = {}) {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
    timer.current = setInterval(fetch_, 1000);
    return () => clearInterval(timer.current);
  }, [patientId, enabled]);

  return { latest, history, loading, error };
}
