import React from "react";
import {
  Heart,
  Droplets,
  Thermometer,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react";

function ECGWave({ bpm, color, height = 56 }) {
  const width = 600;
  const cycles = 3;
  const cycleWidth = width / cycles;
  const mid = height / 2;
  const amp = height * 0.38;

  const buildCycle = (startX) => {
    const tx = (factor) => startX + factor * cycleWidth;
    const ty = (value) => mid - value * amp;
    return [
      [tx(0.0), ty(0)],
      [tx(0.1), ty(0)],
      [tx(0.13), ty(0.15)],
      [tx(0.16), ty(0.25)],
      [tx(0.19), ty(0.15)],
      [tx(0.22), ty(0)],
      [tx(0.3), ty(0)],
      [tx(0.35), ty(-0.15)],
      [tx(0.38), ty(1.0)],
      [tx(0.41), ty(-0.28)],
      [tx(0.46), ty(0)],
      [tx(0.52), ty(0)],
      [tx(0.58), ty(0.08)],
      [tx(0.65), ty(0.38)],
      [tx(0.72), ty(0.38)],
      [tx(0.79), ty(0.08)],
      [tx(1.0), ty(0)],
    ];
  };

  let points = [];
  for (let i = 0; i < cycles; i += 1) points = points.concat(buildCycle(i * cycleWidth));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)},${point[1].toFixed(1)}`)
    .join(" ");
  const duration = `${(60 / (bpm || 72)) * cycles}s`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      <defs>
        <linearGradient id="liveVitalsScan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="80%" stopColor={color} stopOpacity="0.15" />
          <stop offset="92%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" opacity="0.9" strokeLinecap="round" />
      <rect x="0" y="0" width={width} height={height} fill="url(#liveVitalsScan)">
        <animateTransform
          attributeName="transform"
          type="translate"
          from={`-${width} 0`}
          to={`${width} 0`}
          dur={duration}
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}

function PlethWave({ color, height = 56 }) {
  const width = 600;
  const cycles = 4;
  const cycleWidth = width / cycles;
  const mid = height * 0.55;
  const amp = height * 0.35;

  const buildCycle = (startX) => {
    const tx = (factor) => startX + factor * cycleWidth;
    const ty = (value) => mid - value * amp;
    return [
      [tx(0.0), ty(0)],
      [tx(0.12), ty(0)],
      [tx(0.22), ty(0.35)],
      [tx(0.3), ty(0.92)],
      [tx(0.35), ty(1.0)],
      [tx(0.4), ty(0.82)],
      [tx(0.46), ty(0.48)],
      [tx(0.52), ty(0.28)],
      [tx(0.58), ty(0.14)],
      [tx(0.65), ty(0.04)],
      [tx(1.0), ty(0)],
    ];
  };

  let points = [];
  for (let i = 0; i < cycles; i += 1) points = points.concat(buildCycle(i * cycleWidth));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)},${point[1].toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" opacity="0.9" strokeLinecap="round" />
    </svg>
  );
}

function TempSparkline({ history, color, height = 56 }) {
  const width = 600;
  if (!history || history.length < 2) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeWidth="1.5" opacity="0.3" />
      </svg>
    );
  }

  const min = Math.min(...history) - 0.3;
  const max = Math.max(...history) + 0.3;
  const range = max - min || 1;
  const points = history.map((value, index) => [
    (index / (history.length - 1)) * width,
    height - ((value - min) / range) * (height - 8) - 4,
  ]);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)},${point[1].toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" opacity="0.9" strokeLinecap="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3.5" fill={color} />
    </svg>
  );
}

const metricConfig = [
  {
    key: "heart_rate",
    label: "Heart Rate",
    unit: "BPM",
    color: "#dc3545",
    icon: Heart,
    renderWave: (payload) => <ECGWave bpm={payload?.heart_rate || 72} color="#dc3545" />,
    format: (value) => (value == null ? "--" : Number(value).toFixed(0)),
  },
  {
    key: "spo2",
    label: "SpO2",
    unit: "%",
    color: "#0d6efd",
    icon: Droplets,
    renderWave: () => <PlethWave color="#0d6efd" />,
    format: (value) => (value == null ? "--" : Number(value).toFixed(0)),
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "C",
    color: "#198754",
    icon: Thermometer,
    renderWave: (_, history) => (
      <TempSparkline color="#198754" history={history.map((item) => item.temp).filter((item) => item != null)} />
    ),
    format: (value) => (value == null ? "--" : Number(value).toFixed(1)),
  },
];

const LiveVitalsPanel = ({
  title = "Live Vitals Monitor",
  subtitle = "Realtime vitals stream",
  latest,
  history = [],
  loading = false,
  error = "",
  patientLabel = "",
}) => {
  const lastUpdated = latest?.recorded_timestamp
    ? new Date(latest.recorded_timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--";
  const isOnline = latest?.device_status === "online";

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h3 className="h5 fw-black text-dark mb-1">{title}</h3>
            <p className="small text-secondary mb-0">
              {patientLabel ? `${patientLabel} - ` : ""}
              {subtitle}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="badge rounded-pill d-flex align-items-center gap-1"
              style={{
                background: isOnline ? "#d1fae5" : "#fee2e2",
                color: isOnline ? "#065f46" : "#991b1b",
              }}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? "Device Online" : "Device Offline"}
            </span>
            <span className="badge rounded-pill bg-light text-secondary">Last update {lastUpdated}</span>
          </div>
        </div>

        {loading && (
          <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
            <div className="spinner-border spinner-border-sm" role="status" />
            Streaming vitals...
          </div>
        )}

        {error && <div className="alert alert-warning py-2 px-3 small">{error}</div>}

        <div className="row g-3">
          {metricConfig.map((metric) => {
            const Icon = metric.icon;
            const alert =
              metric.key === "heart_rate"
                ? latest?.hr_alert
                : metric.key === "spo2"
                  ? latest?.spo2_alert
                  : latest?.temp_alert;

            return (
              <div className="col-12 col-lg-4" key={metric.key}>
                <div
                  className="rounded-4 p-3 h-100"
                  style={{
                    background: alert ? "#fff5f5" : "#f8fafc",
                    border: `1px solid ${alert ? "rgba(220,53,69,0.2)" : "rgba(148,163,184,0.15)"}`,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="small text-uppercase fw-bold text-secondary">{metric.label}</div>
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36, background: `${metric.color}14`, color: metric.color }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="d-flex align-items-baseline gap-2 mb-2">
                    <span className="fw-black text-dark" style={{ fontSize: "2rem", lineHeight: 1 }}>
                      {metric.format(latest?.[metric.key])}
                    </span>
                    <span className="text-secondary small fw-bold">{metric.unit}</span>
                  </div>
                  <div className="rounded-3 px-2 py-1" style={{ background: "rgba(255,255,255,0.75)" }}>
                    {metric.renderWave(latest, history)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="d-flex align-items-center justify-content-between mt-4 rounded-4 px-3 py-2 bg-light">
          <div className="small text-secondary d-flex align-items-center gap-2">
            <Activity size={14} />
            Device: {latest?.device_name || "Unassigned"}
          </div>
          <div className="small text-secondary">Signal: {(latest?.signal || "na").toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
};

export default LiveVitalsPanel;
