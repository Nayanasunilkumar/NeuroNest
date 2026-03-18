import React, { useEffect, useState } from "react";
import { useAlerts } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";
import { BellRing, X, ToggleRight, ToggleLeft } from "lucide-react";

const DISMISSED_KEY = "neuronest_alert_popup_dismissed";
const ENABLED_KEY = "neuronest_alert_popup_enabled";

const toIdString = (id) => (id == null ? "" : String(id));

const AlertPopup = () => {
  const { alerts, markAcknowledged } = useAlerts();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      // Default to true if not set (enable by default)
      return localStorage.getItem(ENABLED_KEY) !== "false";
    } catch (e) {
      return true;
    }
  });
  const [dismissed, setDismissed] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr.map(toIdString).filter(Boolean));
    } catch (e) {
      return new Set();
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    // If alerts are disabled globally, don't show anything
    if (!isEnabled) {
      setActiveAlert(null);
      return;
    }

    const unacknowledged = alerts
      .filter((a) => !a.is_acknowledged)
      .filter((a) => !dismissed.has(toIdString(a.id)));

    if (unacknowledged.length > 0) {
      // Show the most recent one that hasn't been acknowledged or dismissed
      setActiveAlert(unacknowledged[0]);
    } else {
      setActiveAlert(null);
    }
  }, [alerts, dismissed, isEnabled]);

  const handleToggleAlerts = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem(ENABLED_KEY, String(newState));
  };

  if (!isEnabled || !activeAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col rounded-xl bg-red-600 p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-6 w-6 animate-pulse" />
          <h3 className="font-bold text-lg">CRITICAL ALERT</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleAlerts}
            className="rounded-full p-1 hover:bg-red-700 transition-colors"
            title="Disable critical alert popups"
          >
            {isEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          </button>
          <button
            onClick={() => {
              if (activeAlert?.id) {
                const id = toIdString(activeAlert.id);
                const updated = new Set(dismissed);
                updated.add(id);
                setDismissed(updated);
                localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(updated)));
              }
              setActiveAlert(null);
            }}
            className="rounded-full p-1 hover:bg-red-700 transition-colors"
            title="Close this alert"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="font-semibold text-red-100">Patient needs attention!</p>
        <p className="mt-1 text-sm">{activeAlert.message}</p>
        <p className="mt-1 text-xs text-red-200 uppercase tracking-widest">{activeAlert.vital_type} • {activeAlert.value}</p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            navigate("/doctor/alerts");
            setActiveAlert(null);
          }}
          className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          View Alert
        </button>
        <button
          onClick={() => {
            if (activeAlert?.id) {
              const id = toIdString(activeAlert.id);
              const updated = new Set(dismissed);
              updated.delete(id);
              setDismissed(updated);
              localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(updated)));
              markAcknowledged(activeAlert.id);
            }
          }}
          className="flex-1 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;
