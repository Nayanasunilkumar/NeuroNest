import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { Activity, Calendar, Heart, TrendingUp, ShieldCheck, Clock, Bell, X, Wifi, WifiOff, Thermometer, Droplets } from "lucide-react";
import { getMyNotifications, markNotificationRead } from "../../api/profileApi";
import { Link } from "react-router-dom";
import { io } from 'socket.io-client';
import { getUser } from "../../utils/auth";
import { API_BASE_URL } from "../../config/env";
import "./DashboardHome.css";

const BACKEND_API = API_BASE_URL;

// ── ECG Waveform ───────────────────────────────────────────────
const ECGWave = memo(({ bpm, color, height = 56 }) => {
  const W = 600, cycles = 3, cw = W / cycles;
  const mid = height / 2, amp = height * 0.38;

  const pts = useMemo(() => {
    function ecgCycle(sx) {
      const t = f => sx + f * cw;
      const y = v => mid - v * amp;
      return [
        [t(0.00), y(0)], [t(0.10), y(0)],
        [t(0.13), y(0.15)], [t(0.16), y(0.25)], [t(0.19), y(0.15)],
        [t(0.22), y(0)], [t(0.30), y(0)],
        [t(0.35), y(-0.15)], [t(0.38), y(1.0)], [t(0.41), y(-0.28)],
        [t(0.46), y(0)], [t(0.52), y(0)],
        [t(0.58), y(0.08)], [t(0.65), y(0.38)],
        [t(0.72), y(0.38)], [t(0.79), y(0.08)],
        [t(1.00), y(0)],
      ];
    }
    let res = [];
    for (let i = 0; i < cycles; i++) res = res.concat(ecgCycle(i * cw));
    return res;
  }, [cycles, cw, mid, amp]);

  const d = useMemo(() => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "), [pts]);
  const dur = `${(60 / (bpm || 72)) * cycles}s`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none"
      width="100%" height={height} style={{ display: "block" }}>
      <defs>
        <filter id="ecgGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="65%" stopColor="transparent" />
          <stop offset="85%" stopColor={color} stopOpacity="0.2" />
          <stop offset="94%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {[...Array(4)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={(height / 3) * i} x2={W} y2={(height / 3) * i}
          stroke={color} strokeWidth="0.5" opacity="0.12" />
      ))}
      {[...Array(7)].map((_, i) => (
        <line key={`v${i}`} x1={(W / 6) * i} y1="0" x2={(W / 6) * i} y2={height}
          stroke={color} strokeWidth="0.5" opacity="0.12" />
      ))}
      <line x1="0" y1={mid} x2={W} y2={mid} stroke={color} strokeWidth="0.8" opacity="0.18" />
      <path d={d} fill="none" stroke={color} strokeWidth="3" opacity="0.15"
        strokeLinejoin="round" strokeLinecap="round" filter="url(#ecgGlow)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <rect x="0" y="0" width={W} height={height} fill="url(#scanGrad)">
        <animateTransform attributeName="transform" type="translate"
          from={`-${W} 0`} to={`${W} 0`} dur={dur} repeatCount="indefinite" />
      </rect>
    </svg>
  );
});

// ── Pleth Wave ─────────────────────────────────────────────────
const PlethWave = memo(({ color, height = 56 }) => {
  const W = 600, cycles = 4, cw = W / cycles;
  const mid = height * 0.55, amp = height * 0.35;

  const pts = useMemo(() => {
    function pleth(sx) {
      const t = f => sx + f * cw, y = v => mid - v * amp;
      return [
        [t(0.00), y(0)], [t(0.12), y(0)], [t(0.22), y(0.35)],
        [t(0.30), y(0.92)], [t(0.35), y(1.0)], [t(0.40), y(0.82)],
        [t(0.46), y(0.48)], [t(0.52), y(0.28)], [t(0.58), y(0.14)],
        [t(0.65), y(0.04)], [t(1.00), y(0)],
      ];
    }
    let res = [];
    for (let i = 0; i < cycles; i++) res = res.concat(pleth(i * cw));
    return res;
  }, [cycles, cw, mid, amp]);

  const d = useMemo(() => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "), [pts]);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none"
      width="100%" height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="plethFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(4)].map((_, i) => (
        <line key={i} x1="0" y1={(height / 3) * i} x2={W} y2={(height / 3) * i}
          stroke={color} strokeWidth="0.5" opacity="0.12" />
      ))}
      <path d={`${d} L${W},${height} L0,${height} Z`} fill="url(#plethFill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
});

// ── Temp Sparkline ─────────────────────────────────────────────
const TempSparkline = memo(({ history, color, height = 56 }) => {
  if (!history || history.length < 2) return (
    <svg width="100%" height={height}>
      <line x1="0" y1={height / 2} x2="100%" y2={height / 2}
        stroke={color} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.25" />
    </svg>
  );
  const W = 600;
  const min = Math.min(...history) - 0.3, max = Math.max(...history) + 0.3;
  const rng = max - min || 1;
  const pts = history.map((v, i) => [
    (i / (history.length - 1)) * W,
    height - ((v - min) / rng) * (height - 8) - 4,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none"
      width="100%" height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(4)].map((_, i) => (
        <line key={i} x1="0" y1={(height / 3) * i} x2={W} y2={(height / 3) * i}
          stroke={color} strokeWidth="0.5" opacity="0.12" />
      ))}
      <path d={`${d} L${W},${height} L0,${height} Z`} fill="url(#tempFill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]}
        r="3.5" fill={color} opacity="0.9" />
    </svg>
  );
});

// ── Vitals Section ─────────────────────────────────────────────
function VitalsSection() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [online, setOnline] = useState(false);
  const [isStale, setIsStale] = useState(true);
  const lastUpdateRef = useRef(0);
  const socketRef = useRef(null);
  const user = getUser();
  const patientId = user?.id;

  useEffect(() => {
    if (!patientId) return;

    // Initial fetch
    const fetch_ = async () => {
      try {
        const [lr, hr] = await Promise.all([
          fetch(`${BACKEND_API}/api/vitals/latest`, { headers: { Authorization: `Bearer ${localStorage.getItem("neuronest_token")}` } }),
          fetch(`${BACKEND_API}/api/vitals/history`, { headers: { Authorization: `Bearer ${localStorage.getItem("neuronest_token")}` } }),
        ]);
        const lJson = await lr.json();
        setData(lJson);
        const hJson = await hr.json();
        setHistory(hJson);
        if (lJson.signal !== "na") {
          lastUpdateRef.current = Date.now();
          setOnline(true);
          setIsStale(false);
        } else {
          setOnline(true); 
        }
      } catch { setOnline(false); }
    };
    fetch_();

    // Stale check interval
    const staleTimer = setInterval(() => {
      if (lastUpdateRef.current > 0) {
        const diff = Date.now() - lastUpdateRef.current;
        setIsStale(diff > 15000); // 15s timeout
      }
    }, 5000);

    // Socket connection
    const token = localStorage.getItem("neuronest_token");
    socketRef.current = io(BACKEND_API, {
      query: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_vitals_room', { patient_id: patientId });
    });

    socketRef.current.on('vitals_update', (update) => {
      setData(update);
      lastUpdateRef.current = Date.now();
      setIsStale(false);
      if (update.signal === 'ok' || update.signal === 'weak') {
        setHistory(prev => {
          const newHistory = [...prev, update];
          return newHistory.slice(-60); // Keep last 60
        });
      }
      setOnline(true);
    });

    socketRef.current.on('disconnect', () => {
      setOnline(false);
    });

    return () => {
      clearInterval(staleTimer);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [patientId]);

  const tempHistory = useMemo(() => history.map(h => h.temp).filter(Boolean), [history]);
  const signal = data?.signal || "na";
  const isLive = signal === "ok";
  const isWeak = signal === "weak";
  const anyAlert = data && !!(data.hr_alert || data.spo2_alert || data.temp_alert);

  const vitals = useMemo(() => [
    {
      label: "Heart Rate",
      sub: "ELECTROCARDIOGRAM",
      value: data?.hr ?? null,
      unit: "BPM",
      normal: "60–100 BPM",
      alert: !!data?.hr_alert,
      color: "#dc3545",
      bsColor: "danger",
      icon: <Heart size={18} />,
      wave: "ecg",
      decimals: 0,
    },
    {
      label: "Oxygen Saturation",
      sub: "PHOTOPLETHYSMOGRAPHY",
      value: data?.spo2 ?? null,
      unit: "%",
      normal: "95–100%",
      alert: !!data?.spo2_alert,
      color: "#0d6efd",
      bsColor: "primary",
      icon: <Droplets size={18} />,
      wave: "pleth",
      decimals: 0,
    },
    {
      label: "Body Temperature",
      sub: "DS18B20 PROBE",
      value: data?.temp ?? null,
      unit: "°C",
      normal: "36.1–37.2°C",
      alert: !!data?.temp_alert,
      color: "#198754",
      bsColor: "success",
      icon: <Thermometer size={18} />,
      wave: "temp",
      decimals: 2,
    },
  ], [data]);

  return (
    <div className="mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h5 fw-black text-dark mb-0">Live Vitals Monitor</h2>
          <p className="small text-secondary mb-0">
            Real-time readings from your ESP32 device
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {signal === "no_device" ? (
            <span className="badge rounded-pill d-flex align-items-center gap-1"
              style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", border: "1px solid #e2e8f0" }}>
              <WifiOff size={10} /> NO DEVICE ASSIGNED
            </span>
          ) : (
            <>
              {online && signal !== "na" && !isStale ? (
                <span className="badge rounded-pill d-flex align-items-center gap-1"
                  style={{ background: "#d1fae5", color: "#065f46", fontSize: "0.7rem" }}>
                  <Wifi size={10} /> CONNECTED
                </span>
              ) : (
                <span className="badge rounded-pill d-flex align-items-center gap-1"
                  style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.7rem" }}>
                  <WifiOff size={10} /> DISCONNECTED
                </span>
              )}

              {isLive && (
                <span className="badge rounded-pill bg-success" style={{ fontSize: "0.7rem" }}>
                  ● LIVE
                </span>
              )}
              {isWeak && (
                <span className="badge rounded-pill bg-warning text-dark" style={{ fontSize: "0.7rem" }}>
                  ◐ WEAK SIGNAL
                </span>
              )}
              {signal === "no_finger" && (
                <span className="badge rounded-pill bg-danger" style={{ fontSize: "0.58rem" }}>
                  ○ NO FINGER
                </span>
              )}
              {signal === "initialising" && (
                <span className="badge rounded-pill bg-info" style={{ fontSize: "0.7rem" }}>
                  ◌ INITIALISING
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* No Device Placeholder */}
      {signal === "no_device" && (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-light border border-dashed mb-4">
          <div className="bg-white p-3 rounded-circle shadow-sm d-inline-block mb-3">
             <WifiOff size={32} className="text-secondary opacity-50" />
          </div>
          <h3 className="h6 fw-bold mb-1">No monitoring device connected</h3>
          <p className="small text-secondary mb-0 mx-auto" style={{ maxWidth: "300px" }}>
            Real-time vital monitoring is currently unavailable for this account. Please contact your health provider to assign a hardware device.
          </p>
        </div>
      )}

      {/* Alert Banner */}
      {anyAlert && signal !== "no_device" && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0"
          style={{ background: "#fff1f2", color: "#be123c" }}>
          <span style={{ fontSize: "1rem" }}>🚨</span>
          <span className="fw-bold small">
            Abnormal vitals detected — please consult your doctor immediately.
          </span>
        </div>
      )}

      {/* Vitals Cards */}
      {signal !== "no_device" && (
        <div className="row g-4">
          {vitals.map((v, i) => {
            const fmt = v.value != null ? v.value.toFixed(v.decimals) : "--";
            return (
              <div key={i} className="col-12 col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-translate-y"
                  style={{
                    background: v.alert ? "#fff5f5" : "white",
                    border: v.alert ? "1px solid rgba(220,53,69,0.3) !important" : undefined,
                  }}>

                  {/* Alert strip */}
                  {v.alert && <div className="alt-strip" style={{ height: 3, background: `linear-gradient(90deg, transparent, ${v.color}, transparent)` }} />}

                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="small fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>{v.label}</div>
                        <div style={{ fontSize: "0.58rem", color: "#bbb", letterSpacing: "1px" }}>{v.sub}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {v.alert && <span className="badge bg-danger rounded-pill alt-badge" style={{ fontSize: "0.58rem" }}>⚠ ALERT</span>}
                        <div className={`bg-${v.bsColor} bg-opacity-10 text-${v.bsColor} p-2 rounded-3`}>{v.icon}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-baseline gap-1 mb-2">
                      <span className="fw-black" style={{ fontSize: "2.6rem", lineHeight: 1, color: v.alert ? "#dc3545" : v.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>{fmt}</span>
                      <span className="text-secondary fw-bold" style={{ fontSize: "0.85rem" }}>{v.unit}</span>
                    </div>

                    <div style={{ background: `rgba(${v.bsColor === "danger" ? "220,53,69" : v.bsColor === "primary" ? "13,110,253" : "25,135,84"},0.04)`, borderRadius: 16, overflow: "hidden", padding: "4px 2px", marginBottom: 8 }}>
                      {v.wave === "ecg" && <ECGWave bpm={data?.hr || 72} color={v.alert ? "#dc3545" : v.color} />}
                      {v.wave === "pleth" && <PlethWave color={v.alert ? "#dc3545" : v.color} />}
                      {v.wave === "temp" && <TempSparkline history={tempHistory} color={v.alert ? "#dc3545" : v.color} />}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>NORMAL: {v.normal}</span>
                      <span className={`badge rounded-pill bg-${v.bsColor} bg-opacity-10 text-${v.bsColor}`} style={{ fontSize: "0.6rem" }}>{isLive ? "● LIVE" : isWeak ? "◐ LKG" : "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
const DashboardHome = () => {
  const user = getUser();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getMyNotifications(true);
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="py-2">
      <div className="card border-0 rounded-4 overflow-hidden mb-5 shadow-sm" style={{ background: "linear-gradient(135deg, #0d6efd, #6610f2)" }}>
        <div className="card-body p-3 p-md-4 text-white position-relative">
          <div className="position-relative z-1">
            <h1 className="display-6 fw-black mb-2" style={{ letterSpacing: "-1px" }}>Welcome back, {user?.full_name?.split(" ")[0] || "there"} 👋</h1>
            <p className="lead opacity-75 mb-3 fw-medium">Your health journey is progressing beautifully. Here's your overview for today.</p>
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-white rounded-pill px-4 fw-bold shadow-sm border-0">View Health Report</button>
              <button className="btn btn-outline-light rounded-pill px-4 fw-bold">Emergency SOS</button>
            </div>
          </div>
          <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block">
            <Activity size={200} strokeWidth={1} />
          </div>
        </div>
      </div>

      <VitalsSection />

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h5 fw-black text-dark mb-0">Health Summary</h2>
                <button className="btn btn-link text-primary text-decoration-none fw-bold p-0">Detailed Analysis</button>
              </div>
              <div className="p-5 text-center bg-light rounded-4 border border-dashed text-secondary">
                <TrendingUp size={48} className="mb-3 opacity-25" />
                <h3 className="h6 fw-bold mb-1">Vitality Metrics Loading...</h3>
                <p className="small mb-0">We're synchronizing your latest clinic results from the South Sector lab.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-black text-dark mb-4">Reminders & Alerts</h2>
              <div className="d-flex flex-column gap-3 dashboard-scroll-container">
                {notifications.length > 0 ? (
                  notifications.map(n => {
                    const isUrgent = n.message.toLowerCase().includes("urgent") || n.message.toLowerCase().includes("priority");
                    const isActionRequired = n.type === "appointment_rescheduled";
                    return (
                      <div key={n.id} className={`d-flex gap-3 align-items-start p-3 rounded-4 border-start border-4 ${isUrgent ? "bg-danger bg-opacity-10 border-danger" : isActionRequired ? "bg-warning bg-opacity-10 border-warning" : "bg-primary bg-opacity-10 border-primary"}`}>
                        {isUrgent ? <ShieldCheck size={20} className="text-danger mt-1" /> : isActionRequired ? <Clock size={20} className="text-warning mt-1" /> : <Bell size={20} className="text-primary mt-1" />}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <div className="fw-bold small text-dark d-flex align-items-center gap-2">{n.title} {isUrgent && <span className="badge bg-danger rounded-pill" style={{ fontSize: "0.6rem" }}>PRIORITY</span>}</div>
                            <button onClick={() => handleMarkRead(n.id)} className="btn btn-link p-0 text-muted" title="Dismiss"><X size={14} /></button>
                          </div>
                          <p className="small text-secondary mb-2 lh-sm">{n.message}</p>
                          {isActionRequired && <Link to="/patient/appointments" className="btn btn-warning btn-sm py-0 px-2 rounded-pill fw-bold" style={{ fontSize: "0.7rem" }}>Review New Time</Link>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="d-flex gap-3 align-items-start p-3 rounded-4 bg-primary bg-opacity-10 border-start border-4 border-primary">
                      <ShieldCheck size={20} className="text-primary mt-1" />
                      <div><div className="fw-bold small text-dark">Insurance Verified</div><p className="small text-secondary mb-0">Your medical coverage has been updated for the 2026 term.</p></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
