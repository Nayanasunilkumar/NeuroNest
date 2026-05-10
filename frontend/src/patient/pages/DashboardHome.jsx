import React, { useEffect, useRef, useMemo, memo } from "react";
import { Activity, Heart, Wifi, WifiOff, Thermometer, Droplets, Info } from "lucide-react";
import { io } from "socket.io-client";
import { getUser } from "../../shared/utils/auth";
import { API_BASE_URL } from "../../config/env";
import DashboardEnhancements from "./DashboardEnhancements";
import "./DashboardHome.css";

const BACKEND_API = API_BASE_URL;
const VITALS_TIMEOUT_MS = 10000;
// How long (ms) to show "Weak Signal" and retain last HR/SpO2 after finger removal
const WEAK_SIGNAL_GRACE_MS = 12000;
// Polling interval (ms) as a fallback alongside Socket.io
const POLL_INTERVAL_MS = 3000;

const EMPTY_VITALS = {
  hr: null,
  spo2: null,
  temp: null,
  hr_alert: 0,
  spo2_alert: 0,
  temp_alert: 0,
  signal: "disconnected",
};

// ─── FIX 1 & 2: sanitizeVitalsPayload no longer clears temp or HR/SpO2.
// Temp is ALWAYS preserved from payload when a numeric value is present.
// HR/SpO2 retention for no_finger is handled by lastGoodHrSpo2Ref in VitalsSection.
const sanitizeVitalsPayload = (payload, connected = true) => {
  if (!payload) return null;
  const signal = payload.signal || "na";

  // Device not assigned — clear everything including temp
  if (signal === "no_device") {
    return { ...payload, hr: null, spo2: null, temp: null, hr_alert: 0, spo2_alert: 0, temp_alert: 0, signal: "no_device", connected: false };
  }

  // Physically disconnected — clear everything
  if (!connected || signal === "disconnected") {
    return { ...payload, hr: null, spo2: null, temp: null, hr_alert: 0, spo2_alert: 0, temp_alert: 0, signal: "disconnected", connected: false };
  }

  // For all other signals (ok, weak, no_finger, initialising, na):
  // Validate and coerce each vital individually. Temp is NEVER cleared by signal state.
  const hr = Number(payload.hr);
  const spo2 = Number(payload.spo2);
  const temp = Number(payload.temp);

  return {
    ...payload,
    connected,
    // HR and SpO2: pass through what the backend sends; no_finger retention handled in component
    hr: Number.isFinite(hr) && hr > 0 ? hr : null,
    spo2: Number.isFinite(spo2) && spo2 > 0 ? spo2 : null,
    // Temp validated by plausible ambient/body range only (>= 10°C).
    // 30.37°C is a valid DS18B20 reading and must never be rejected.
    // Temp is NEVER cleared by signal state — only by disconnection/no_device.
    temp: Number.isFinite(temp) && temp >= 10 ? temp : null,
    hr_alert: Number.isFinite(hr) && hr > 0 ? (payload.hr_alert ?? 0) : 0,
    spo2_alert: Number.isFinite(spo2) && spo2 > 0 ? (payload.spo2_alert ?? 0) : 0,
    temp_alert: Number.isFinite(temp) && temp >= 10 ? (payload.temp_alert ?? 0) : 0,
  };
};

const isFreshVitals = (payload) => {
  if (!payload?.ts) return false;
  const timestamp = new Date(payload.ts).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp <= VITALS_TIMEOUT_MS;
};

// ─── Waveform components (unchanged) ─────────────────────────────────────────

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
  }, [amp, cw, mid]);

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
  }, [amp, cw, mid]);
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

// ─── VitalsSection ────────────────────────────────────────────────────────────

function VitalsSection({ initialData = null }) {
  const initialLatest = initialData?.latest || null;
  const initialFresh = isFreshVitals(initialLatest) || initialLatest?.connected === true;

  const [data, setData] = React.useState(() => sanitizeVitalsPayload(initialLatest, initialFresh));
  const [history, setHistory] = React.useState(() => (initialFresh ? (initialData?.history || []) : []));
  const [deviceAssigned, setDeviceAssigned] = React.useState(Boolean(initialData?.deviceAssigned || initialData?.latest?.deviceAssigned));
  const [online, setOnline] = React.useState(initialFresh);
  const [lastVitalsTimestamp, setLastVitalsTimestamp] = React.useState(() => (initialFresh ? Date.now() : 0));

  // FIX 2: last known good HR/SpO2 with timestamp for grace-period retention
  const lastGoodHrSpo2Ref = useRef({ hr: null, spo2: null, ts: 0 });
  // FIX 2: derived "in grace period" state — triggers re-render
  const [inGracePeriod, setInGracePeriod] = React.useState(false);

  const lastUpdateRef = useRef(initialFresh ? Date.now() : 0);
  const socketRef = useRef(null);
  // FIX 3: poll interval ref so we can clear it on unmount
  const pollIntervalRef = useRef(null);

  const user = getUser();
  const userId = user?.id;
  const userPatientId = user?.patient_id;
  const nestedPatientId = user?.patient?.id;
  const profileUserId = user?.profile?.user_id;
  const patientId = userId || userPatientId || nestedPatientId || profileUserId;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const authHeaders = () => {
    const token = localStorage.getItem("neuronest_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const markDisconnected = React.useCallback(() => {
    setOnline(false);
    setLastVitalsTimestamp(0);
    setData((prev) => ({
      ...(prev || EMPTY_VITALS),
      hr: null,
      spo2: null,
      temp: null,
      hr_alert: 0,
      spo2_alert: 0,
      temp_alert: 0,
      signal: "disconnected",
      connected: false,
    }));
    setHistory([]);
    lastGoodHrSpo2Ref.current = { hr: null, spo2: null, ts: 0 };
    setInGracePeriod(false);
  }, []);

  // ── Apply last-known-good HR/SpO2 retention logic ────────────────────────
  // Called whenever new vitals arrive (socket or poll).
  //
  // Signal taxonomy after backend processing:
  //   "ok"          — finger present, fresh reading
  //   "weak"        — either Arduino's own 15s grace (has valid hr/spo2) OR
  //                   backend grace period (may have valid hr/spo2 from last_good)
  //   "no_finger"   — no finger, grace expired on both Arduino + backend
  //   "initialising"— sensor warming up, no hr/spo2
  //
  // Rule: if signal is "weak" AND hr/spo2 are valid numbers, trust them directly
  // (Arduino's grace — do NOT double-wrap in our own grace). Only activate our
  // frontend grace for "no_finger"/"initialising" where hr/spo2 are truly absent.
  const applyVitalsUpdate = React.useCallback((rawPayload, connected = true) => {
    const next = sanitizeVitalsPayload(rawPayload, connected);
    if (!next) return;

    const signal = next.signal || "na";
    const now = Date.now();

    if (signal === "ok" || (signal === "weak" && next.hr != null && next.spo2 != null)) {
      // Live or Arduino-grace reading with real values — store as last-good, display directly.
      // temp is always included in last-good so it survives no_finger transitions.
      lastGoodHrSpo2Ref.current = {
        hr: next.hr,
        spo2: next.spo2,
        temp: next.temp ?? lastGoodHrSpo2Ref.current.temp,
        ts: now,
      };
      setInGracePeriod(false);
      setData(next);
    } else if (
      signal === "no_finger" ||
      signal === "initialising" ||
      (signal === "weak" && (next.hr == null || next.spo2 == null))
    ) {
      // Finger absent (or backend-weak with no values) — activate frontend grace period.
      const { hr: lastHr, spo2: lastSpo2, temp: lastTemp, ts: lastTs } = lastGoodHrSpo2Ref.current;
      const graceMsElapsed = now - lastTs;

      // Preserve last known temp even if the incoming payload has null temp
      const displayTemp = next.temp ?? lastTemp ?? null;

      if (lastHr != null && lastSpo2 != null && graceMsElapsed < WEAK_SIGNAL_GRACE_MS) {
        // Within frontend grace — keep last HR/SpO2 + temp visible, show "Weak Signal"
        setData({
          ...next,
          hr: lastHr,
          spo2: lastSpo2,
          temp: displayTemp,
          hr_alert: 0,
          spo2_alert: 0,
          signal: "weak",
        });
        setInGracePeriod(true);
      } else {
        // Grace expired — clear HR/SpO2 but always keep temp
        setData({
          ...next,
          hr: null,
          spo2: null,
          temp: displayTemp,
          hr_alert: 0,
          spo2_alert: 0,
        });
        setInGracePeriod(false);
        lastGoodHrSpo2Ref.current = { hr: null, spo2: null, temp: displayTemp, ts: 0 };
      }
    } else {
      // Any other state (disconnected, no_device, etc.) — pass through
      setData(next);
      setInGracePeriod(false);
    }
  }, []);

  // ── FIX 3: Polling fetch function ─────────────────────────────────────────
  const fetchVitals = React.useCallback(async () => {
    if (!patientId) return;
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetch(`${BACKEND_API}/api/vitals/latest`, { headers: authHeaders() }),
        fetch(`${BACKEND_API}/api/vitals/history`, { headers: authHeaders() }),
      ]);

      if (!latestRes.ok) return; // Don't disturb existing state on transient errors

      const latestJson = await latestRes.json();
      const historyJson = await historyRes.json().catch(() => []);

      console.info("[VITALS_FRONTEND] poll response", {
        patientId,
        signal: latestJson.signal,
        hr: latestJson.hr,
        spo2: latestJson.spo2,
        temp: latestJson.temp,
      });

      const connected = latestJson.connected === true || isFreshVitals(latestJson);
      setDeviceAssigned(Boolean(latestJson.deviceAssigned || latestJson.signal !== "no_device"));

      if (connected) {
        applyVitalsUpdate(latestJson, true);
        setHistory(Array.isArray(historyJson) ? historyJson : []);
        lastUpdateRef.current = Date.now();
        setLastVitalsTimestamp(Date.now());
        setOnline(true);
      } else if (latestJson.signal === "no_device") {
        setOnline(false);
      } else {
        setOnline(false);
      }
    } catch {
      console.error("[VITALS_FRONTEND] poll failed");
      // Don't call markDisconnected on a single poll failure — socket may still be live
    }
  }, [patientId, applyVitalsUpdate]);

  // ── Grace-period expiry ticker ────────────────────────────────────────────
  // Re-evaluates every second while in grace period so the UI clears on time.
  // Fix: also sets signal back to "no_finger" so the UI never shows WEAK SIGNAL
  // with blank HR/SpO2 values during the 1-3s gap before the next poll arrives.
  useEffect(() => {
    if (!inGracePeriod) return undefined;
    const ticker = setInterval(() => {
      const { hr: lastHr, ts: lastTs } = lastGoodHrSpo2Ref.current;
      if (lastHr == null || Date.now() - lastTs >= WEAK_SIGNAL_GRACE_MS) {
        setData((prev) =>
          prev
            ? { ...prev, hr: null, spo2: null, hr_alert: 0, spo2_alert: 0, signal: "no_finger" }
            : prev
        );
        setInGracePeriod(false);
        lastGoodHrSpo2Ref.current = { hr: null, spo2: null, ts: 0 };
      }
    }, 1000);
    return () => clearInterval(ticker);
  }, [inGracePeriod]);

  // ── Main effect: initial fetch + socket + stale timer + FIX 3 poll ────────
  useEffect(() => {
    if (!patientId) return undefined;

    console.info("[VITALS_FRONTEND] resolved patient id", { patientId });

    // Initial load
    fetchVitals();

    // FIX 3: Polling every POLL_INTERVAL_MS as both real-time updater
    // and Socket.io fallback (Render cold starts can silently drop sockets)
    pollIntervalRef.current = setInterval(fetchVitals, POLL_INTERVAL_MS);

    // Stale-data watchdog
    const staleTimer = setInterval(() => {
      if (lastUpdateRef.current > 0 && Date.now() - lastUpdateRef.current > VITALS_TIMEOUT_MS) {
        lastUpdateRef.current = 0;
        markDisconnected();
      }
    }, 1000);

    // Socket.io (real-time, faster than polling)
    const token = localStorage.getItem("neuronest_token");
    socketRef.current = io(BACKEND_API, {
      query: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      const room = `patient_vitals_${patientId}`;
      console.info("[VITALS_FRONTEND] socket connected, joining", { room });
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
        signal: update?.signal,
        hr: update?.hr,
        spo2: update?.spo2,
        temp: update?.temp,
      });

      // FIX 2: Use applyVitalsUpdate instead of sanitizeVitalsPayload directly
      applyVitalsUpdate(update, true);
      setDeviceAssigned(Boolean(update.deviceAssigned || update.patient_id));
      lastUpdateRef.current = Date.now();
      setLastVitalsTimestamp(Date.now());
      setOnline(true);

      if (update.signal === "ok" || update.signal === "weak" || update.signal === "no_finger") {
        setHistory((prev) => {
          const sanitized = sanitizeVitalsPayload(update, true);
          return sanitized ? [...prev, sanitized].slice(-60) : prev;
        });
      } else {
        setHistory([]);
      }
    });

    socketRef.current.on("disconnect", (reason) => {
      // Don't immediately clear vitals on socket disconnect — polling runs every
      // POLL_INTERVAL_MS and the stale watchdog will confirm true disconnection
      // after VITALS_TIMEOUT_MS. This prevents a flash of "DISCONNECTED" when
      // Socket.io drops momentarily while the ESP32 is still posting data.
      console.warn("[VITALS_FRONTEND] socket disconnected, reason:", reason);
      // Only hard-disconnect if we have no recent data at all
      if (lastUpdateRef.current === 0) {
        markDisconnected();
      }
    });

    return () => {
      clearInterval(staleTimer);
      clearInterval(pollIntervalRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [patientId, fetchVitals, applyVitalsUpdate, markDisconnected]);

  // ── Derived display state ─────────────────────────────────────────────────

  const tempHistory = useMemo(() => history.map((item) => item.temp).filter(Boolean), [history]);

  const signal = data?.signal || (deviceAssigned ? "initialising" : "no_device");
  const isLive = signal === "ok";
  // FIX 2: "weak" covers both genuine weak signal AND our grace-period synthetic "weak"
  const isWeak = signal === "weak";
  const isNoFinger = signal === "no_finger";
  const isConnected = online && lastVitalsTimestamp > 0 && signal !== "disconnected" && signal !== "na";

  // FIX 1 & 2: HR/SpO2 visible when live OR weak (which includes grace period)
  const canShowHeartVitals = isConnected && (isLive || isWeak);
  // FIX 1: Temp always visible when connected, regardless of finger state
  const canShowTempVitals = isConnected && (isLive || isWeak || isNoFinger || signal === "initialising");

  const anyAlert =
    (canShowHeartVitals && !!(data?.hr_alert || data?.spo2_alert)) ||
    (canShowTempVitals && !!data?.temp_alert);

  const vitals = useMemo(
    () => [
      {
        label: "Heart Rate",
        sub: "ELECTROCARDIOGRAM",
        value: canShowHeartVitals ? (data?.hr ?? null) : null,
        unit: "BPM",
        normal: "60-100 BPM",
        alert: canShowHeartVitals && !!data?.hr_alert,
        // FIX 2: show "Weak Signal" badge on HR card during grace period
        graceActive: inGracePeriod && canShowHeartVitals,
        color: "#dc3545",
        bsColor: "danger",
        icon: <Heart size={18} />,
        wave: "ecg",
        decimals: 0,
      },
      {
        label: "Oxygen Saturation",
        sub: "PHOTOPLETHYSMOGRAPHY",
        value: canShowHeartVitals ? (data?.spo2 ?? null) : null,
        unit: "%",
        normal: "95-100%",
        alert: canShowHeartVitals && !!data?.spo2_alert,
        // FIX 2: show "Weak Signal" badge on SpO2 card during grace period
        graceActive: inGracePeriod && canShowHeartVitals,
        color: "#0d6efd",
        bsColor: "primary",
        icon: <Droplets size={18} />,
        wave: "pleth",
        decimals: 0,
      },
      {
        label: "Body Temperature",
        sub: "DS18B20 PROBE",
        // FIX 1: temp shown whenever canShowTempVitals — no finger state can block it
        value: canShowTempVitals ? (data?.temp ?? null) : null,
        unit: "C",
        normal: "36.1-37.2 C",
        alert: canShowTempVitals && !!data?.temp_alert,
        graceActive: false,
        color: "#198754",
        bsColor: "success",
        icon: <Thermometer size={18} />,
        wave: "temp",
        decimals: 2,
      },
    ],
    [canShowHeartVitals, canShowTempVitals, data, inGracePeriod]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h5 fw-black text-dark mb-0">Live Vitals Monitor</h2>
          <p className="small text-secondary mb-0">Real-time readings from your ESP32 device</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!deviceAssigned || signal === "no_device" ? (
            <span
              className="badge rounded-pill d-flex align-items-center gap-1"
              style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", border: "1px solid #e2e8f0" }}
            >
              <WifiOff size={10} /> NO DEVICE ASSIGNED
            </span>
          ) : (
            <>
              {isConnected ? (
                <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: "#d1fae5", color: "#065f46", fontSize: "0.7rem" }}>
                  <Wifi size={10} /> CONNECTED
                </span>
              ) : (
                <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.7rem" }}>
                  <WifiOff size={10} /> DISCONNECTED
                </span>
              )}
              {/* FIX 3: Show LIVE badge whenever connected and isLive */}
              {isConnected && isLive && (
                <span className="badge rounded-pill bg-success" style={{ fontSize: "0.7rem" }}>LIVE</span>
              )}
              {/* FIX 2: "Weak Signal" in header when genuinely weak or in grace period */}
              {isConnected && isWeak && (
                <span className="badge rounded-pill bg-warning text-dark" style={{ fontSize: "0.7rem" }}>
                  {inGracePeriod ? "WEAK SIGNAL" : "WEAK SIGNAL"}
                </span>
              )}
              {isConnected && isNoFinger && (
                <span className="badge rounded-pill bg-secondary" style={{ fontSize: "0.58rem" }}>NO FINGER</span>
              )}
              {signal === "initialising" && (
                <span className="badge rounded-pill bg-info" style={{ fontSize: "0.7rem" }}>INITIALISING</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sensor Diagnostics Panel */}
      {deviceAssigned && signal !== "no_device" && (
        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "#f8fafc" }}>
          <div className="card-body p-3 d-flex flex-wrap gap-4 align-items-center justify-content-center">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small fw-bold">ESP32:</span>
              <span className={`badge rounded-pill ${isConnected ? "bg-success" : "bg-danger"}`} style={{ fontSize: "0.6rem" }}>
                {isConnected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 border-start ps-4">
              <span className="text-secondary small fw-bold">MAX30102:</span>
              <span className={`badge rounded-pill ${isLive || isWeak ? "bg-success" : "bg-secondary"}`} style={{ fontSize: "0.6rem" }}>
                {isLive || isWeak ? "ACTIVE" : isNoFinger ? "NO FINGER" : "IDLE"}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 border-start ps-4">
              <span className="text-secondary small fw-bold">DS18B20:</span>
              {/* FIX 1: DS18B20 shows ACTIVE whenever temp data is available, regardless of finger */}
              <span className={`badge rounded-pill ${isConnected && data?.temp != null ? "bg-success" : "bg-secondary"}`} style={{ fontSize: "0.6rem" }}>
                {isConnected && data?.temp != null ? "ACTIVE" : "IDLE"}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 border-start ps-4">
              <span className="text-secondary small fw-bold text-uppercase" style={{ fontSize: "0.6rem" }}>Last Sync:</span>
              <span className="text-dark small fw-bold" style={{ fontSize: "0.7rem" }}>
                {lastVitalsTimestamp > 0 ? new Date(lastVitalsTimestamp).toLocaleTimeString() : "--:--:--"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No device banner */}
      {(!deviceAssigned || signal === "no_device") && (
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

      {/* No-finger info banner — only when not in grace period */}
      {deviceAssigned && isConnected && isNoFinger && !inGracePeriod && (
        <div className="alert d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0" style={{ background: "#f8fafc", color: "#475569" }}>
          <Info size={16} />
          <span className="fw-bold small">No finger detected. Place your finger on the sensor to resume live readings.</span>
        </div>
      )}

      {/* Grace-period info banner */}
      {inGracePeriod && (
        <div className="alert d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0" style={{ background: "#fffbeb", color: "#92400e" }}>
          <Info size={16} />
          <span className="fw-bold small">Finger removed — showing last known HR &amp; SpO2 values. Readings will clear shortly.</span>
        </div>
      )}

      {anyAlert && deviceAssigned && signal !== "no_device" && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0" style={{ background: "#fff1f2", color: "#be123c" }}>
          <span style={{ fontSize: "1rem" }}>!</span>
          <span className="fw-bold small">Abnormal vitals detected — please consult your doctor immediately.</span>
        </div>
      )}

      {/* Vitals cards */}
      {deviceAssigned && signal !== "no_device" && (
        <div className="row g-4">
          {vitals.map((vital, index) => {
            const formatted = vital.value != null ? vital.value.toFixed(vital.decimals) : "--";
            return (
              <div key={index} className="col-12 col-md-4">
                <div
                  className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-translate-y"
                  style={{
                    background: vital.alert ? "#fff5f5" : "white",
                    border: vital.alert ? "1px solid rgba(220,53,69,0.3)" : undefined,
                  }}
                >
                  {vital.alert && (
                    <div className="alt-strip" style={{ height: 3, background: `linear-gradient(90deg, transparent, ${vital.color}, transparent)` }} />
                  )}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="small fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>
                          {vital.label}
                        </div>
                        <div style={{ fontSize: "0.58rem", color: "#bbb", letterSpacing: "1px" }}>{vital.sub}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {vital.alert && (
                          <span className="badge bg-danger rounded-pill alt-badge" style={{ fontSize: "0.58rem" }}>ALERT</span>
                        )}
                        {/* FIX 2: "Weak Signal" badge on individual HR/SpO2 cards during grace period */}
                        {vital.graceActive && !vital.alert && (
                          <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: "0.58rem" }}>WEAK SIGNAL</span>
                        )}
                        <div className={`bg-${vital.bsColor} bg-opacity-10 text-${vital.bsColor} p-2 rounded-3`}>
                          {vital.icon}
                        </div>
                      </div>
                    </div>

                    {/* Value display */}
                    <div className="d-flex align-items-baseline gap-1 mb-2">
                      <span
                        className="fw-black"
                        style={{
                          fontSize: "2.6rem",
                          lineHeight: 1,
                          color: vital.alert ? "#dc3545" : vital.graceActive ? "#b45309" : vital.color,
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "-1px",
                        }}
                      >
                        {formatted}
                      </span>
                      <span className="text-secondary fw-bold" style={{ fontSize: "0.85rem" }}>{vital.unit}</span>
                    </div>

                    {/* Waveforms */}
                    <div
                      style={{
                        background: `rgba(${vital.bsColor === "danger" ? "220,53,69" : vital.bsColor === "primary" ? "13,110,253" : "25,135,84"},0.04)`,
                        borderRadius: 16,
                        overflow: "hidden",
                        padding: "4px 2px",
                        marginBottom: 8,
                      }}
                    >
                      {canShowHeartVitals && vital.wave === "ecg" && (
                        <ECGWave bpm={data?.hr || 72} color={vital.alert ? "#dc3545" : vital.graceActive ? "#b45309" : vital.color} />
                      )}
                      {canShowHeartVitals && vital.wave === "pleth" && (
                        <PlethWave color={vital.alert ? "#dc3545" : vital.graceActive ? "#b45309" : vital.color} />
                      )}
                      {canShowTempVitals && vital.wave === "temp" && (
                        <TempSparkline history={tempHistory} color={vital.alert ? "#dc3545" : vital.color} />
                      )}
                      {(vital.wave === "ecg" || vital.wave === "pleth") && !canShowHeartVitals && (
                        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700 }}>
                          No Data
                        </div>
                      )}
                      {vital.wave === "temp" && !canShowTempVitals && (
                        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700 }}>
                          No Data
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>
                        NORMAL: {vital.normal}
                      </span>
                      <span
                        className={`badge rounded-pill bg-${vital.bsColor} bg-opacity-10 text-${vital.bsColor}`}
                        style={{ fontSize: "0.6rem" }}
                      >
                        {vital.wave === "temp"
                          ? canShowTempVitals ? "LIVE" : "-"
                          : canShowHeartVitals
                            ? vital.graceActive ? "RETAINED" : isLive ? "LIVE" : "WEAK"
                            : "-"}
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

// ─── DashboardHome ────────────────────────────────────────────────────────────

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
            <h1 className="display-6 fw-black mb-2" style={{ letterSpacing: "-1px" }}>
              Welcome back, {user?.full_name?.split(" ")[0] || "there"}
            </h1>
            <p className="lead opacity-75 mb-0 fw-medium">
              A calm clinical view of your appointments, medications, alerts, and daily health trends.
            </p>
          </div>
          <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block">
            <Activity size={200} strokeWidth={1} />
          </div>
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
