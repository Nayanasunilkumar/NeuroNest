import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Heart, Droplets, Thermometer, Clock, Activity, AlertTriangle } from "lucide-react";
import { getLatestVitals, getVitalsHistory } from "../../api/vitals";

function parseTimestamp(ts) {
  if (!ts) return null;
  // ISO strings without timezone are treated as local by JS Date.
  // Ensure we treat vitals timestamps as UTC when timezone is missing.
  if (typeof ts === "string" && !ts.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(ts)) {
    ts = `${ts}Z`;
  }
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatAgo(ts) {
  const d = parseTimestamp(ts);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusForVital(key, value) {
  if (value == null) return { label: "Unknown", level: "neutral" };

  if (key === "hr") {
    if (value > 120) return { label: "Critical", level: "critical" };
    if (value > 100) return { label: "Warning", level: "warning" };
    if (value < 40) return { label: "Critical", level: "critical" };
    if (value < 50) return { label: "Warning", level: "warning" };
    return { label: "Normal", level: "normal" };
  }

  if (key === "spo2") {
    if (value < 90) return { label: "Critical", level: "critical" };
    if (value < 95) return { label: "Warning", level: "warning" };
    return { label: "Normal", level: "normal" };
  }

  if (key === "temp") {
    if (value > 38.0) return { label: "Critical", level: "critical" };
    if (value > 37.5) return { label: "Fever", level: "warning" };
    if (value < 35.0) return { label: "Low", level: "warning" };
    return { label: "Normal", level: "normal" };
  }

  return { label: "Unknown", level: "neutral" };
}

function VitalCard({ title, icon, value, unit, status, helper }) {
  const colors = {
    normal: { border: "#22c55e", text: "#166534" },
    warning: { border: "#f97316", text: "#9a3412" },
    critical: { border: "#dc2626", text: "#7f1d1d" },
    neutral: { border: "#94a3b8", text: "#334155" },
  };
  const theme = colors[status.level] || colors.neutral;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ borderLeft: `5px solid ${theme.border}` }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="small fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>
              {title}
            </div>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              {helper}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3" style={{ background: "rgba(15,23,42,0.06)" }}>
              {icon}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-baseline gap-2 mb-2">
          <span className="fw-black" style={{ fontSize: "2.4rem", letterSpacing: "-1px" }}>
            {value != null ? value : "--"}
          </span>
          <span className="text-secondary fw-bold" style={{ fontSize: "0.85rem" }}>
            {unit}
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-secondary" style={{ fontSize: "0.72rem" }}>
            {status.label}
          </span>
          <span className="badge" style={{ background: theme.border + "20", color: theme.text, fontSize: "0.65rem" }}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ title, data, dataKey, unit, color }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="small fw-bold text-uppercase text-secondary" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>
              {title}
            </div>
          </div>
          <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
            {unit}
          </div>
        </div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
              <Tooltip
                labelStyle={{ color: "#0F172A" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }}
              />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AssessmentPage() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLimit, setHistoryLimit] = useState(60);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchVitals = async () => {
      try {
        const [l, h] = await Promise.all([getLatestVitals(), getVitalsHistory()]);
        if (!active) return;
        setLatest(l);
        setHistory(h);
        setLastUpdated(new Date().toISOString());
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load vitals");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const transformedHistory = useMemo(() => {
    if (!history || !history.length) return [];
    const sliced = history.slice(-historyLimit);
    return sliced
      .slice()
      .reverse()
      .map((item) => {
        const d = parseTimestamp(item.ts);
        return {
          label: d
            ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--",
          hr: item.hr,
          spo2: item.spo2,
          temp: item.temp,
        };
      });
  }, [history, historyLimit]);

  const baseline = useMemo(() => {
    if (!history || !history.length) return { hr: null, spo2: null, temp: null };
    const valid = history.filter((v) => v.hr != null && v.spo2 != null && v.temp != null);
    if (!valid.length) return { hr: null, spo2: null, temp: null };
    const sum = valid.reduce(
      (acc, curr) => {
        acc.hr += curr.hr || 0;
        acc.spo2 += curr.spo2 || 0;
        acc.temp += curr.temp || 0;
        return acc;
      },
      { hr: 0, spo2: 0, temp: 0 },
    );
    return {
      hr: Math.round(sum.hr / valid.length),
      spo2: Math.round(sum.spo2 / valid.length),
      temp: Number((sum.temp / valid.length).toFixed(2)),
    };
  }, [history]);

  const healthScore = useMemo(() => {
    if (!latest) return null;
    let score = 100;
    const hrStatus = statusForVital("hr", latest.hr);
    const spo2Status = statusForVital("spo2", latest.spo2);
    const tempStatus = statusForVital("temp", latest.temp);

    if (hrStatus.level === "warning") score -= 10;
    if (hrStatus.level === "critical") score -= 25;
    if (spo2Status.level === "warning") score -= 10;
    if (spo2Status.level === "critical") score -= 25;
    if (tempStatus.level === "warning") score -= 10;
    if (tempStatus.level === "critical") score -= 25;

    const variability = history.length >= 5 ? Math.max(...history.map((v) => v.hr || 0)) - Math.min(...history.map((v) => v.hr || 0)) : 0;
    if (variability > 20) score -= 10;

    return Math.max(0, Math.min(100, score));
  }, [latest, history]);

  const alerts = useMemo(() => {
    if (!latest) return [];
    const list = [];
    const hrStatus = statusForVital("hr", latest.hr);
    const spo2Status = statusForVital("spo2", latest.spo2);
    const tempStatus = statusForVital("temp", latest.temp);

    if (hrStatus.level === "warning") list.push(`⚠ Heart rate elevated (${latest.hr} BPM)`);
    if (hrStatus.level === "critical") list.push(`⚠ Critical heart rate (${latest.hr} BPM)`);

    if (spo2Status.level === "warning") list.push(`⚠ SpO₂ slightly low (${latest.spo2}%)`);
    if (spo2Status.level === "critical") list.push(`⚠ Critical SpO₂ (${latest.spo2}%)`);

    if (tempStatus.level === "warning") list.push(`⚠ Temperature elevated (${latest.temp}°C)`);
    if (tempStatus.level === "critical") list.push(`⚠ High fever detected (${latest.temp}°C)`);

    return list;
  }, [latest]);

  const deviceStatus = useMemo(() => {
    if (!latest) return "Offline";
    if (latest.signal === "ok") return "Connected";
    if (latest.signal === "weak") return "Weak Connection";
    return "Disconnected";
  }, [latest]);

  return (
    <div style={{ padding: "0 32px 32px" }}>
      <header style={{ padding: "24px 0" }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Assessment
        </h1>
        <p style={{ margin: "8px 0 0", color: "#64748B" }}>
          Analyze vitals trends and generate a quick health summary based on recent readings.
        </p>
      </header>

      <section className="mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Current Vitals Snapshot</h2>
            <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
              Last updated: {formatAgo(latest?.ts)}
            </div>
          </div>
          <div className="badge rounded-pill" style={{ background: latest ? "#DCFCE7" : "#F8FAFC", color: latest ? "#166534" : "#64748B" }}>
            <Activity size={14} className="me-1" /> {deviceStatus}
          </div>
        </div>

        <div className="row g-4 mt-3">
          <div className="col-12 col-md-4">
            <VitalCard
              title="Heart Rate"
              icon={<Heart size={18} />}
              value={latest?.hr}
              unit="BPM"
              status={statusForVital("hr", latest?.hr)}
              helper={`Baseline ${baseline.hr ?? "--"} BPM`}
            />
          </div>
          <div className="col-12 col-md-4">
            <VitalCard
              title="Oxygen Saturation"
              icon={<Droplets size={18} />}
              value={latest?.spo2}
              unit="%"
              status={statusForVital("spo2", latest?.spo2)}
              helper={`Baseline ${baseline.spo2 ?? "--"}%`}
            />
          </div>
          <div className="col-12 col-md-4">
            <VitalCard
              title="Body Temperature"
              icon={<Thermometer size={18} />}
              value={latest?.temp}
              unit="°C"
              status={statusForVital("temp", latest?.temp)}
              helper={`Baseline ${baseline.temp ?? "--"}°C`}
            />
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Trend Charts</h2>
            <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
              Review how vitals have changed over the most recent readings.
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
              Filter:
            </span>
            <select
            className="form-select form-select-sm"
            style={{ width: "160px" }}
            value={historyLimit}
            onChange={(e) => setHistoryLimit(Number(e.target.value))}
          >
            <option value={15}>Last 15 readings</option>
            <option value={30}>Last 30 readings</option>
            <option value={60}>Last 60 readings</option>
          </select>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <TrendChart title="Heart Rate" data={transformedHistory} dataKey="hr" unit="BPM" color="#dc2626" />
          </div>
          <div className="col-12 col-lg-4">
            <TrendChart title="SpO₂" data={transformedHistory} dataKey="spo2" unit="%" color="#0d6efd" />
          </div>
          <div className="col-12 col-lg-4">
            <TrendChart title="Temperature" data={transformedHistory} dataKey="temp" unit="°C" color="#16a34a" />
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Health Summary</h2>
            <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
              A quick snapshot of stability and trends.
            </div>
          </div>
          <div className="badge rounded-pill" style={{ background: "#eef2ff", color: "#3730a3" }}>
            Score: {healthScore ?? "—"} / 100
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h3 className="h6 fw-bold mb-3">Alerts</h3>
              {alerts.length ? (
                <ul className="mb-0 ps-3">
                  {alerts.map((a, idx) => (
                    <li key={idx} className="text-danger" style={{ marginBottom: 6 }}>
                      <AlertTriangle size={16} className="me-2" /> {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-success mb-0">No alerts detected. Vitals are stable.</p>
              )}
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h3 className="h6 fw-bold mb-3">Recent History</h3>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                <table className="table table-borderless mb-0">
                  <thead>
                    <tr>
                      <th className="text-secondary small">Time</th>
                      <th className="text-secondary small">HR</th>
                      <th className="text-secondary small">SpO₂</th>
                      <th className="text-secondary small">Temp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transformedHistory.slice(0, 10).map((v, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td className="small text-secondary" style={{ width: 100 }}>{v.label}</td>
                        <td className="small" style={{ width: 80 }}>{v.hr ?? "--"}</td>
                        <td className="small" style={{ width: 80 }}>{v.spo2 ?? "--"}</td>
                        <td className="small" style={{ width: 80 }}>{v.temp ?? "--"}</td>
                      </tr>
                    ))}
                    {!transformedHistory.length && (
                      <tr>
                        <td colSpan={4} className="text-center text-secondary py-4">
                          No vitals data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-muted py-4">Loading vitals...</div>
      )}
    </div>
  );
}

export default AssessmentPage;
