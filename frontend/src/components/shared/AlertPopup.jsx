import React, { useEffect, useState } from "react";
import { useAlerts } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";
import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/solid";

const AlertPopup = () => {
  const { alerts, markAcknowledged } = useAlerts();
  const [activeAlert, setActiveAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unacknowledged = alerts.filter(a => !a.is_acknowledged);
    if (unacknowledged.length > 0) {
      // Show the most recent one that hasn't been acknowledged
      setActiveAlert(unacknowledged[0]);
    } else {
      setActiveAlert(null);
    }
  }, [alerts]);

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col rounded-xl bg-red-600 p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-6 w-6 animate-pulse" />
          <h3 className="font-bold text-lg">CRITICAL ALERT</h3>
        </div>
        <button onClick={() => setActiveAlert(null)} className="rounded-full p-1 hover:bg-red-700 transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3">
        <p className="font-semibold text-red-100">Patient needs attention!</p>
        <p className="mt-1 text-sm">{activeAlert.message}</p>
        <p className="mt-1 text-xs text-red-200 uppercase tracking-widest">{activeAlert.vital_type} • {activeAlert.value}</p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            navigate("/doctor/alerts"); // We'll map this route later or just /alerts depending on role
            setActiveAlert(null);
          }}
          className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          View Alert
        </button>
        <button
          onClick={() => markAcknowledged(activeAlert.id)}
          className="flex-1 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;
