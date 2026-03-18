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
    <div 
      className="nn-alert-popup-floating"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '360px',
        background: 'rgba(239, 68, 68, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        color: 'white',
        animation: 'nn-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '8px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'nn-pulse-icon 2s infinite'
          }}>
            <BellRing size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>
              Critical Alert
            </h3>
            <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 700 }}>NEURONEST SAFETY ENGINE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleToggleAlerts}
            style={{ 
              background: 'transparent', border: 'none', color: 'white', opacity: 0.6, cursor: 'pointer', padding: '4px',
              transition: 'opacity 0.2s' 
            }}
            title="Disable floating alerts"
          >
            {isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
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
            style={{ 
              background: 'rgba(0,0,0,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '6px',
              transition: 'background 0.2s' 
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
          Vital Signs Exception
        </div>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: 1.4, fontWeight: 500 }}>
          {activeAlert.message || "Patient vitals have reached a critical threshold requiring immediate review."}
        </p>
        <div style={{ 
          marginTop: '12px', 
          padding: '10px 14px', 
          background: 'rgba(0,0,0,0.15)', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', opacity: 0.8 }}>
            {activeAlert.vital_type || 'Unknown Type'}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>
            {activeAlert.value || '--'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            navigate("/doctor/alerts");
            setActiveAlert(null);
          }}
          style={{ 
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', 
            background: 'white', color: '#EF4444', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Detailed View
        </button>
        <button
          onClick={() => {
            if (activeAlert?.id) {
              markAcknowledged(activeAlert.id);
            }
          }}
          style={{ 
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', 
            background: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Acknowledge
        </button>
      </div>

      <style>{`
        @keyframes nn-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nn-pulse-icon {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
      `}</style>
    </div>
  );
};

export default AlertPopup;
