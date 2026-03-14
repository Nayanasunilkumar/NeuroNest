import React from "react";
import { Wifi, WifiOff, Heart, Thermometer, Droplets } from "lucide-react";

function ECGWave({ bpm, color, height = 56 }) {
  const W = 600, cycles = 3, cw = W / cycles;
  const mid = height / 2, amp = height * 0.38;
  function ecgCycle(sx) {
    const t = f => sx + f * cw, y = v => mid - v * amp;
    return [
      [t(0.00),y(0)],[t(0.10),y(0)],[t(0.13),y(0.15)],[t(0.16),y(0.25)],
      [t(0.19),y(0.15)],[t(0.22),y(0)],[t(0.30),y(0)],[t(0.35),y(-0.15)],
      [t(0.38),y(1.0)],[t(0.41),y(-0.28)],[t(0.46),y(0)],[t(0.52),y(0)],
      [t(0.58),y(0.08)],[t(0.65),y(0.38)],[t(0.72),y(0.38)],[t(0.79),y(0.08)],
      [t(1.00),y(0)],
    ];
  }
  let pts = [];
  for (let i = 0; i < cycles; i++) pts = pts.concat(ecgCycle(i * cw));
  const d = pts.map((p,i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const dur = `${(60/(bpm||72))*cycles}s`;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.85"/>
      <rect x="0" y="0" width={W} height={height} fill="transparent">
        <animateTransform attributeName="transform" type="translate" from={`-${W} 0`} to={`${W} 0`} dur={dur} repeatCount="indefinite"/>
      </rect>
    </svg>
  );
}

function PlethWave({ color, height = 56 }) {
  const W = 600, cycles = 4, cw = W / cycles;
  const mid = height * 0.55, amp = height * 0.35;
  function pleth(sx) {
    const t = f => sx + f * cw, y = v => mid - v * amp;
    return [
      [t(0.00),y(0)],[t(0.12),y(0)],[t(0.22),y(0.35)],[t(0.30),y(0.92)],
      [t(0.35),y(1.0)],[t(0.40),y(0.82)],[t(0.46),y(0.48)],[t(0.52),y(0.28)],
      [t(0.58),y(0.14)],[t(0.65),y(0.04)],[t(1.00),y(0)],
    ];
  }
  let pts = [];
  for (let i = 0; i < cycles; i++) pts = pts.concat(pleth(i * cw));
  const d = pts.map((p,i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.85"/>
    </svg>
  );
}

function TempSparkline({ history, color, height = 56 }) {
  if (!history || history.length < 2) return (
    <svg width="100%" height={height}>
      <line x1="0" y1={height/2} x2="100%" y2={height/2} stroke={color} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.25"/>
    </svg>
  );
  const W = 600;
  const min = Math.min(...history) - 0.3, max = Math.max(...history) + 0.3;
  const rng = max - min || 1;
  const pts = history.map((v,i) => [(i/(history.length-1))*W, height-((v-min)/rng)*(height-8)-4]);
  const d = pts.map((p,i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.85"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3.5" fill={color} opacity="0.9"/>
    </svg>
  );
}

const LiveVitalsPanel = ({ title, subtitle, latest, history, loading, error }) => {
  const signal = latest?.signal || "na";
  const isOnline = !!latest && signal !== "na";
  const isLive = signal === "ok";
  const isWeak = signal === "weak";
  const tempHistory = (history || []).map(h => h.temp).filter(Boolean);
  const anyAlert = latest && !!(latest.hr_alert || latest.spo2_alert || latest.temp_alert);

  const vitals = [
    {
      label: "Heart Rate", sub: "ELECTROCARDIOGRAM",
      value: latest?.hr ?? null, unit: "BPM", normal: "60–100 BPM",
      alert: !!latest?.hr_alert, color: "#dc3545", bsColor: "danger",
      icon: <Heart size={16}/>, wave: "ecg", decimals: 0,
    },
    {
      label: "SpO2", sub: "PHOTOPLETHYSMOGRAPHY",
      value: latest?.spo2 ?? null, unit: "%", normal: "95–100%",
      alert: !!latest?.spo2_alert, color: "#0d6efd", bsColor: "primary",
      icon: <Droplets size={16}/>, wave: "pleth", decimals: 0,
    },
    {
      label: "Temperature", sub: "DS18B20 PROBE",
      value: latest?.temp ?? null, unit: "°C", normal: "36.1–37.2°C",
      alert: !!latest?.temp_alert, color: "#198754", bsColor: "success",
      icon: <Thermometer size={16}/>, wave: "temp", decimals: 2,
    },
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-black mb-0">{title}</h5>
          <p className="small text-secondary mb-0">{subtitle}</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isOnline ? (
            <span className="badge rounded-pill d-flex align-items-center gap-1"
              style={{ background:"#d1fae5", color:"#065f46", fontSize:"0.7rem" }}>
              <Wifi size={10}/> Connected
            </span>
          ) : (
            <span className="badge rounded-pill d-flex align-items-center gap-1"
              style={{ background:"#fee2e2", color:"#991b1b", fontSize:"0.7rem" }}>
              <WifiOff size={10}/> Device Offline
            </span>
          )}
          {isLive && <span className="badge rounded-pill bg-success" style={{fontSize:"0.7rem"}}>● LIVE</span>}
          {isWeak && <span className="badge rounded-pill bg-warning text-dark" style={{fontSize:"0.7rem"}}>◐ WEAK</span>}
          {signal === "no_finger" && <span className="badge rounded-pill bg-danger" style={{fontSize:"0.7rem"}}>○ NO FINGER</span>}
          {signal === "initialising" && <span className="badge rounded-pill bg-info" style={{fontSize:"0.7rem"}}>◌ INITIALISING</span>}
          <span className="small text-secondary">
            LAST UPDATE {latest?.ts ? new Date(latest.ts + "Z").toLocaleTimeString() : "--"}
          </span>
        </div>
      </div>

      {/* Alert Banner */}
      {anyAlert && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 mb-3 py-2 px-3 border-0"
          style={{ background:"#fff1f2", color:"#be123c" }}>
          <span>🚨</span>
          <span className="fw-bold small">Abnormal vitals detected — patient requires immediate attention.</span>
        </div>
      )}

      {/* Vitals Cards */}
      <div className="row g-3">
        {vitals.map((v, i) => {
          const fmt = v.value != null ? v.value.toFixed(v.decimals) : "--";
          return (
            <div key={i} className="col-12 col-md-4">
              <div className="card border-0 rounded-4 h-100"
                style={{ background: v.alert ? "#fff5f5" : "#f8f9fa" }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="small fw-bold text-uppercase text-secondary"
                        style={{ fontSize:"0.65rem", letterSpacing:"1px" }}>{v.label}</div>
                      <div style={{ fontSize:"0.55rem", color:"#bbb", letterSpacing:"1px" }}>{v.sub}</div>
                    </div>
                    <div className={`bg-${v.bsColor} bg-opacity-10 text-${v.bsColor} p-2 rounded-3`}>
                      {v.icon}
                    </div>
                  </div>
                  <div className="d-flex align-items-baseline gap-1 mb-2">
                    <span className="fw-black" style={{
                      fontSize:"2.2rem", lineHeight:1,
                      color: v.alert ? "#dc3545" : v.color,
                      fontVariantNumeric:"tabular-nums", letterSpacing:"-1px"
                    }}>{fmt}</span>
                    <span className="text-secondary fw-bold" style={{fontSize:"0.8rem"}}>{v.unit}</span>
                  </div>
                  <div style={{ borderRadius:8, overflow:"hidden", padding:"2px", marginBottom:6,
                    background:`rgba(${v.bsColor==="danger"?"220,53,69":v.bsColor==="primary"?"13,110,253":"25,135,84"},0.04)` }}>
                    {v.wave === "ecg" && <ECGWave bpm={latest?.hr||72} color={v.alert?"#dc3545":v.color}/>}
                    {v.wave === "pleth" && <PlethWave color={v.alert?"#dc3545":v.color}/>}
                    {v.wave === "temp" && <TempSparkline history={tempHistory} color={v.alert?"#dc3545":v.color}/>}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary" style={{fontSize:"0.6rem"}}>NORMAL: {v.normal}</span>
                    <span className={`badge rounded-pill bg-${v.bsColor} bg-opacity-10 text-${v.bsColor}`}
                      style={{fontSize:"0.6rem"}}>
                      {isLive ? "● LIVE" : isWeak ? "◐ LKG" : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveVitalsPanel;
