import React, { useEffect, useRef, useMemo, memo } from "react";
import { Activity, Heart, Wifi, WifiOff, Thermometer, Droplets, Info } from "lucide-react";
import { io } from "socket.io-client";
import { getUser } from "../../shared/utils/auth";
import { API_BASE_URL } from "../../config/env";
import DashboardEnhancements from "./DashboardEnhancements";
import "./DashboardHome.css";

const BACKEND_API = API_BASE_URL;
const VITALS_TIMEOUT_MS = 10000;
const EMPTY_VITALS = {
  hr: null,
  spo2: null,
  temp: null,
  hr_alert: 0,
  spo2_alert: 0,
  temp_alert: 0,
  signal: "disconnected",
};

const clearClinicalVitals = (payload = {}) => ({
  ...payload,
  hr: null,
  spo2: null,
  hr_alert: 0,
  spo2_alert: 0,
});

const sanitizeVitalsPayload = (payload, connected = true) => {
  if (!payload) return null;
  const signal = payload.signal || "na";
  if (signal === "no_device") return clearClinicalVitals({ ...payload, signal: "no_device", connected: false });
  if (!connected || signal === "disconnected") return clearClinicalVitals({ ...payload, signal: "disconnected", connected: false });
  if (signal === "no_finger") return clearClinicalVitals({ ...payload, connected: true });
  if (signal !== "ok" && signal !== "weak") return clearClinicalVitals({ ...payload, connected });

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

const isFreshVitals = (payload) => {
  if (!payload?.ts) return false;
  const timestamp = new Date(payload.ts).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp <= VITALS_TIMEOUT_MS;
};

const ECGWave = memo(({ bpm, color, height = 56 }) => {
  const W = 600;
  const cycles = 3;
  const cw = W / cycles;
  const mid = height / 2;
  const amp = height * 0.38;

  const pts = useMemo(() => {
    function ecgCycle(sx) {
      const t = (f) => sx + f * cw;
      const y = (v) => mid - v * amp;
      return [
        [t(0.0), y(0)], [t(0.1), y(0)], [t(0.13), y(0.15)], [t(0.16), y(0.25)], [t(0.19), y(0.15)],
        [t(0.22), y(0)], [t(0.3), y(0)], [t(0.35), y(-0.15)], [t(0.38), y(1.0)], [t(0.41), y(-0.28)],
        [t(0.46), y(0)], [t(0.52), y(0)], [t(0.58), y(0.08)], [t(0.65), y(0.38)], [t(0.72), y(0.38)],
        [t(0.79), y(0.08)], [t(1.0), y(0)],
      ];
    }
    let res = [];
    for (let i = 0; i < cycles; i += 1) res = res.concat(ecgCycle(i * cw));
    return res;
  }, [amp, cw, cycles, mid]);

  const d = useMemo(() => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "), [pts]);
  const dur = `${(60 / (bpm || 72)) * cycles}s`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height} style={{ display: "block" }}>
      <defs>
        <filter id="ecgGlow"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" /><stop offset="65%" stopColor="transparent" />
          <stop offset="85%" stopColor={color} stopOpacity="0.2" /><stop offset="94%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {[...Array(4)].map((_, i) => <line key={`h${i}`} x1="0" y1={(height / 3) * i} x2={W} y2={(height / 3) * i} stroke={color} strokeWidth="0.5" opacity="0.12" />)}
      {[...Array(7)].map((_, i) => <line key={`v${i}`} x1={(W / 6) * i} y1="0" x2={(W / 6) * i} y2={height} stroke={color} strokeWidth="0.5" opacity="0.12" />)}
      <line x1="0" y1={mid} x2={W} y2={mid} stroke={color} strokeWidth="0.8" opacity="0.18" />
      <path d={d} fill="none" stroke={color} strokeWidth="3" opacity="0.15" strokeLinejoin="round" strokeLinecap="round" filter="url(#ecgGlow)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <rect x="0" y="0" width={W} height={height} fill="url(#scanGrad)">
        <animateTransform attributeName="transform" type="translate" from={`-${W} 0`} to={`${W} 0`} dur={dur} repeatCount="indefinite" />
      </rect>
    </svg>
  );
});

const PlethWave = memo(({ color, height = 56 }) => {
  const W = 600;
  const cycles = 4;
  const cw = W / cycles;
  const mid = height * 0.55;
  const amp = height * 0.35;
  const pts = useMemo(() => {
    function pleth(sx) {
      const t = (f) => sx + f * cw;
      const y = (v) => mid - v * amp;
      return [[t(0.0), y(0)], [t(0.12), y(0)], [t(0.22), y(0.35)], [t(0.3), y(0.92)], [t(0.35), y(1.0)], [t(0.4), y(0.82)], [t(0.46), y(0.48)], [t(0.52), y(0.28)], [t(0.58), y(0.14)], [t(0.65), y(0.04)], [t(1.0), y(0)]];
    }
    let res = [];
    for (let i = 0; i < cycles; i += 1) res = res.concat(pleth(i * cw));
    return res;
  }, [amp, cw, cycles, mid]);
  const d = useMemo(() => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "), [pts]);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height} style={{ display: "block" }}>
      <defs><linearGradient id="plethFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[...Array(4)].map((_, i) => <line key={i} x1="0" y1={(height / 3) * i} x2={W} y2={(height / 3) * i} stroke={color} strokeWidth="0.5" opacity="0.12" />)}
      <path d={`${d} L${W},${height} L0,${height} Z`} fill="url(#plethFill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
});

const TempSparkline = memo(({ history, color, height = 56 }) => {
  if (!history || history.length < 2) return <svg width="100%" height={height}><line x1="0" y1={height / 2} x2="100%" y2={height / 2} stroke={color} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.25" /></svg>;
  const W = 600;
  const min = Math.min(...history) - 0.3;
  const max = Math.max(...history) + 0.3;
  const rng = max - min || 1;
  const pts = history.map((v, i) => [(i / (history.length - 1)) * W, height - ((v - min) / rng) * (height - 8) - 4]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height} style={{ display: "block" }}>
      <defs><linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[...Array(4)].map((_, i) => <line key={i} x1="0" y1={(height / 3) * i} x2={W} y2={(height / 3) * i} stroke={color} strokeWidth="0.5" opacity="0.12" />)}
      <path d={`${d} L${W},${height} L0,${height} Z`} fill="url(#tempFill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={color} opacity="0.9" />
    </svg>
  );
});

function VitalsSection({ initialData = null }) {
  const initialLatest = initialData?.latest || null;
  const initialFresh = isFreshVitals(initialLatest) || initialLatest?.connected === true;
  const [data, setData] = React.useState(() => sanitizeVitalsPayload(initialLatest, initialFresh));
  const [history, setHistory] = React.useState(() => (initialFresh ? (initialData?.history || []) : []));
  const [deviceAssigned, setDeviceAssigned] = React.useState(Boolean(initialData?.deviceAssigned || initialData?.latest?.deviceAssigned));
  const [online, setOnline] = React.useState(initialFresh);
  const [lastVitalsTimestamp, setLastVitalsTimestamp] = React.useState(() => (initialFresh ? Date.now() : 0));
  const lastUpdateRef = useRef(initialFresh ? Date.now() : 0);
  const socketRef = useRef(null);
  const user = getUser();
  const userId = user?.id;
  const userPatientId = user?.patient_id;
  const nestedPatientId = user?.patient?.id;
  const profileUserId = user?.profile?.user_id;
  const profileId = user?.profile?.id;
  const patientId = userId || userPatientId || nestedPatientId || profileUserId;

  useEffect(() => {
    if (!patientId) return undefined;
    console.info("[VITALS_FRONTEND] resolved patient id for vitals", {
      patientId,
      userId,
      patientIdField: userPatientId,
      nestedPatientId,
      profileUserId,
      profileId,
    });
    
    const fetchVitals = async () => {
      try {
        const [latestResponse, historyResponse] = await Promise.all([
          fetch(`${BACKEND_API}/api/vitals/latest`, { headers: { Authorization: `Bearer ${localStorage.getItem("neuronest_token")}` } }),
          fetch(`${BACKEND_API}/api/vitals/history`, { headers: { Authorization: `Bearer ${localStorage.getItem("neuronest_token")}` } }),
        ]);
        const latestJson = await latestResponse.json();
        const historyJson = await historyResponse.json();
        console.info("[VITALS_FRONTEND] latest/history response", {
          patientId,
          latest: latestJson,
          historyCount: Array.isArray(historyJson) ? historyJson.length : "non-array",
        });
        const connected = latestJson.connected === true || isFreshVitals(latestJson);
        const nextData = sanitizeVitalsPayload(latestJson, connected);
        setData(nextData);
        setHistory(connected ? (Array.isArray(historyJson) ? historyJson : []) : []);
        setDeviceAssigned(Boolean(latestJson.deviceAssigned || latestJson.signal !== "no_device"));
        if (connected && (latestJson.signal === "ok" || latestJson.signal === "weak" || latestJson.signal === "no_finger")) {
          lastUpdateRef.current = Date.now();
          setLastVitalsTimestamp(Date.now());
          setOnline(true);
        } else if (latestJson.signal === "no_device") {
          setOnline(false);
        } else {
          setOnline(false);
        }
      } catch {
        console.error("[VITALS_FRONTEND] failed to fetch latest/history");
        setData((prev) => clearClinicalVitals({ ...(prev || EMPTY_VITALS), signal: "disconnected", connected: false }));
        setHistory([]);
        setOnline(false);
      }
    };
    fetchVitals();

    const markDisconnected = () => {
      setOnline(false);
      setLastVitalsTimestamp(0);
      setData((prev) => clearClinicalVitals({ ...(prev || EMPTY_VITALS), signal: "disconnected", connected: false }));
      setHistory([]);
    };

    const staleTimer = setInterval(() => {
      if (lastUpdateRef.current > 0 && Date.now() - lastUpdateRef.current > VITALS_TIMEOUT_MS) {
        lastUpdateRef.current = 0;
        markDisconnected();
      }
    }, 1000);

    const token = localStorage.getItem("neuronest_token");
    socketRef.current = io(BACKEND_API, { query: { token }, transports: ["websocket", "polling"], withCredentials: true });
    socketRef.current.on("connect", () => {
      const room = `patient_vitals_${patientId}`;
      console.info("[VITALS_FRONTEND] socket connected, joining vitals room", { patientId, room, socketId: socketRef.current.id });
      socketRef.current.emit("join_vitals_room", { patient_id: Number(patientId) });
    });
    socketRef.current.on("vitals_room_joined", (payload) => {
      console.info("[VITALS_FRONTEND] vitals room joined", payload);
      setDeviceAssigned(true);
    });
    socketRef.current.on("vitals_error", (payload) => {
      console.error("[VITALS_FRONTEND] vitals socket error", payload);
    });
    socketRef.current.on("vitals_update", (update) => {
      console.info("[VITALS_FRONTEND] vitals_update received", {
        joinedPatientId: patientId,
        updatePatientId: update?.patient_id,
        expectedRoom: `patient_vitals_${patientId}`,
        signal: update?.signal,
      });
      const nextUpdate = sanitizeVitalsPayload(update, true);
      setData(nextUpdate);
      setDeviceAssigned(Boolean(update.deviceAssigned || update.patient_id));
      lastUpdateRef.current = Date.now();
      setLastVitalsTimestamp(Date.now());
      if ((update.signal === "ok" || update.signal === "weak" || update.signal === "no_finger")) {
        setHistory((prev) => [...prev, nextUpdate].slice(-60));
      } else {
        setHistory([]);
      }
      setOnline(true);
    });
    socketRef.current.on("disconnect", () => {
      markDisconnected();
    });

    return () => {
      clearInterval(staleTimer);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [patientId, userId, userPatientId, nestedPatientId, profileUserId, profileId]);

  const tempHistory = useMemo(() => history.map((item) => item.temp).filter(Boolean), [history]);
  const signal = data?.signal || (deviceAssigned ? "initialising" : "no_device");
  const isLive = signal === "ok";
  const isWeak = signal === "weak";
  const isNoFinger = signal === "no_finger";
  const isConnected = online && lastVitalsTimestamp > 0 && signal !== "disconnected" && signal !== "na";
  const canShowHeartVitals = isConnected && (isLive || isWeak);
  const canShowTempVitals = isConnected && (isLive || isWeak || isNoFinger);
  const anyAlert = (canShowHeartVitals && !!(data?.hr_alert || data?.spo2_alert)) || (canShowTempVitals && !!data?.temp_alert);
  const vitals = useMemo(() => [
    { label: "Heart Rate", sub: "ELECTROCARDIOGRAM", value: canShowHeartVitals ? data?.hr ?? null : null, unit: "BPM", normal: "60-100 BPM", alert: canShowHeartVitals && !!data?.hr_alert, color: "#dc3545", bsColor: "danger", icon: <Heart size={18} />, wave: "ecg", decimals: 0 },
    { label: "Oxygen Saturation", sub: "PHOTOPLETHYSMOGRAPHY", value: canShowHeartVitals ? data?.spo2 ?? null : null, unit: "%", normal: "95-100%", alert: canShowHeartVitals && !!data?.spo2_alert, color: "#0d6efd", bsColor: "primary", icon: <Droplets size={18} />, wave: "pleth", decimals: 0 },
    { label: "Body Temperature", sub: "DS18B20 PROBE", value: canShowTempVitals ? data?.temp ?? null : null, unit: "C", normal: "36.1-37.2 C", alert: canShowTempVitals && !!data?.temp_alert, color: "#198754", bsColor: "success", icon: <Thermometer size={18} />, wave: "temp", decimals: 2 },
  ], [canShowHeartVitals, canShowTempVitals, data]);

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h2 className="h5 fw-black text-dark mb-0">Live Vitals Monitor</h2><p className="small text-secondary mb-0">Real-time readings from your ESP32 device</p></div>
        <div className="d-flex align-items-center gap-2">
          {!deviceAssigned || signal === "no_device" ? (
            <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", border: "1px solid #e2e8f0" }}><WifiOff size={10} /> NO DEVICE ASSIGNED</span>
          ) : (
            <>
              {isConnected ? <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: "#d1fae5", color: "#065f46", fontSize: "0.7rem" }}><Wifi size={10} /> CONNECTED</span> : <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.7rem" }}><WifiOff size={10} /> DISCONNECTED</span>}
              {isConnected && isLive && <span className="badge rounded-pill bg-success" style={{ fontSize: "0.7rem" }}>LIVE</span>}
              {isConnected && isWeak && <span className="badge rounded-pill bg-warning text-dark" style={{ fontSize: "0.7rem" }}>WEAK SIGNAL</span>}
              {isConnected && isNoFinger && <span className="badge rounded-pill bg-secondary" style={{ fontSize: "0.58rem" }}>NO FINGER</span>}
              {signal === "initialising" && <span className="badge rounded-pill bg-info" style={{ fontSize: "0.7rem" }}>INITIALISING</span>}
            </>
          )}
        </div>
      </div>
      {(!deviceAssigned || signal === "no_device") && (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-light border border-dashed mb-4">
          <div className="bg-white p-3 rounded-circle shadow-sm d-inline-block mb-3"><WifiOff size={32} className="text-secondary opacity-50" /></div>
          <h3 className="h6 fw-bold mb-1">No monitoring device connected</h3>
          <p className="small text-secondary mb-0 mx-auto" style={{ maxWidth: "300px" }}>Real-time vital monitoring is currently unavailable for this account. Please contact your health provider to assign a hardware device.</p>
        </div>
      )}

      {deviceAssigned && isConnected && isNoFinger && (
        <div className="alert d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0" style={{ background: "#f8fafc", color: "#475569" }}>
          <Info size={16} />
          <span className="fw-bold small">No finger detected. Place your finger on the sensor to resume live readings.</span>
        </div>
      )}

      {anyAlert && deviceAssigned && signal !== "no_device" && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0" style={{ background: "#fff1f2", color: "#be123c" }}>
          <span style={{ fontSize: "1rem" }}>!</span>
          <span className="fw-bold small">Abnormal vitals detected - please consult your doctor immediately.</span>
        </div>
      )}

      {deviceAssigned && signal !== "no_device" && (
        <div className="row g-4">
          {vitals.map((vital, index) => {
            const formatted = vital.value != null ? vital.value.toFixed(vital.decimals) : "--";
            return (
              <div key={index} className="col-12 col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-translate-y" style={{ background: vital.alert ? "#fff5f5" : "white", border: vital.alert ? "1px solid rgba(220,53,69,0.3)" : undefined }}>
                  {vital.alert && <div className="alt-strip" style={{ height: 3, background: `linear-gradient(90deg, transparent, ${vital.color}, transparent)` }} />}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div><div className="small fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>{vital.label}</div><div style={{ fontSize: "0.58rem", color: "#bbb", letterSpacing: "1px" }}>{vital.sub}</div></div>
                      <div className="d-flex align-items-center gap-2">
                        {vital.alert && <span className="badge bg-danger rounded-pill alt-badge" style={{ fontSize: "0.58rem" }}>ALERT</span>}
                        <div className={`bg-${vital.bsColor} bg-opacity-10 text-${vital.bsColor} p-2 rounded-3`}>{vital.icon}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-baseline gap-1 mb-2">
                      <span className="fw-black" style={{ fontSize: "2.6rem", lineHeight: 1, color: vital.alert ? "#dc3545" : vital.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>{formatted}</span>
                      <span className="text-secondary fw-bold" style={{ fontSize: "0.85rem" }}>{vital.unit}</span>
                    </div>
                    <div style={{ background: `rgba(${vital.bsColor === "danger" ? "220,53,69" : vital.bsColor === "primary" ? "13,110,253" : "25,135,84"},0.04)`, borderRadius: 16, overflow: "hidden", padding: "4px 2px", marginBottom: 8 }}>
                      {canShowHeartVitals && vital.wave === "ecg" && <ECGWave bpm={data?.hr || 72} color={vital.alert ? "#dc3545" : vital.color} />}
                      {canShowHeartVitals && vital.wave === "pleth" && <PlethWave color={vital.alert ? "#dc3545" : vital.color} />}
                      {canShowTempVitals && vital.wave === "temp" && <TempSparkline history={tempHistory} color={vital.alert ? "#dc3545" : vital.color} />}
                      {((vital.wave === "ecg" || vital.wave === "pleth") && !canShowHeartVitals) && <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700 }}>No Data</div>}
                      {(vital.wave === "temp" && !canShowTempVitals) && <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700 }}>No Data</div>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>NORMAL: {vital.normal}</span>
                      <span className={`badge rounded-pill bg-${vital.bsColor} bg-opacity-10 text-${vital.bsColor}`} style={{ fontSize: "0.6rem" }}>
                        {vital.wave === "temp" ? (canShowTempVitals ? "LIVE" : "-") : (canShowHeartVitals ? (isLive ? "LIVE" : "WEAK") : "-")}
                      </span>
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

const DashboardHome = () => {
  const user = getUser();
  const [consolidatedData, setConsolidatedData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { getConsolidatedDashboard } = await import("../../shared/services/api/profileApi");
        const data = await getConsolidatedDashboard();
        setConsolidatedData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="py-2 nn-dashboard-shell">
      <div className="card border-0 rounded-4 overflow-hidden mb-4 shadow-sm nn-hero-card">
        <div className="card-body p-3 p-md-4 text-white position-relative">
          <div className="position-relative z-1">
            <span className="nn-hero-kicker">Patient Command Center</span>
            <h1 className="display-6 fw-black mb-2" style={{ letterSpacing: "-1px" }}>Welcome back, {user?.full_name?.split(" ")[0] || "there"}</h1>
            <p className="lead opacity-75 mb-0 fw-medium">A calm clinical view of your appointments, medications, alerts, and daily health trends.</p>
          </div>
          <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block"><Activity size={200} strokeWidth={1} /></div>
        </div>
      </div>
      
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Dashboard...</span>
          </div>
        </div>
      ) : (
        <>
          <VitalsSection initialData={consolidatedData?.vitals} />
          <DashboardEnhancements consolidatedData={consolidatedData} />
        </>
      )}
    </div>
  );
};

export default DashboardHome;
