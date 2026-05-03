import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ReferenceLine,
} from "recharts";
import {
  Heart,
  Droplets,
  Thermometer,
  Clock,
  Activity,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Download,
} from "lucide-react";
import { getLatestVitals, getVitalsHistory, downloadAssessmentReport } from "../../shared/services/vitals";

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

function getTrendInfo(value, baseline) {
  if (value == null || baseline == null) return { direction: "", percent: null };
  if (baseline === 0) return { direction: "", percent: null };
  const diff = value - baseline;
  const percent = Math.round((diff / baseline) * 100);
  const direction = diff === 0 ? "" : diff > 0 ? "up" : "down";
  return { direction, percent: Math.abs(percent) };
}

function VitalCard({ title, icon, value, unit, status, baseline, trend }) {
  const colors = {
    normal: { border: "#22c55e", bg: "#ECFDF5", text: "#166534" },
    warning: { border: "#f97316", bg: "#FFEDD5", text: "#9a3412" },
    critical: { border: "#dc2626", bg: "#FEE2E2", text: "#7f1d1d" },
    neutral: { border: "#94a3b8", bg: "#F1F5F9", text: "#334155" },
  };
  const theme = colors[status.level] || colors.neutral;

  const arrow = trend?.direction === "up" ? <ArrowUp size={16} /> : trend?.direction === "down" ? <ArrowDown size={16} /> : null;
  const trendLabel = trend?.percent != null ? `${trend.percent}% ${trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : ""}` : "";

  return (
    <div
      className="card border-0 shadow-sm rounded-4 h-100"
      style={{ borderLeft: `5px solid ${theme.border}`, background: theme.bg }}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div className="p-2 rounded-3" style={{ background: "rgba(15,23,42,0.06)" }}>
                {icon}
              </div>
              <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                {title}
              </div>
            </div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              Baseline: {baseline ?? "--"} {unit}
            </div>
          </div>
          <div className="text-end">
            <div className="fw-black" style={{ fontSize: "2.4rem", letterSpacing: "-1px", color: theme.text }}>
              {value != null ? value : "--"}
            </div>
            <div className="text-secondary" style={{ fontSize: "0.8rem" }}>
              {unit}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.85rem", color: theme.text }}>
            {arrow}
            {trendLabel}
          </div>
          <span className="badge" style={{ background: theme.border + "20", color: theme.text, fontSize: "0.65rem" }}>
            {status.label}
          </span>
        </div>

        {status.label && (
          <div className="mt-2" style={{ fontSize: "0.72rem", color: theme.text }}>
            {status.label === "Critical" && "⚠ Critical — please review immediately."}
            {status.label === "Warning" && "⚠ Warning — check trends."}
            {status.label === "Normal" && "✔ Within normal range."}
          </div>
        )}
      </div>
    </div>
  );
}

function TrendChart({ title, data, dataKey, unit, color, rangeMin, rangeMax }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="small fw-bold text-uppercase text-secondary" style={{ fontSize: "0.68rem", letterSpacing: "1px" }}>
              {title}
            </div>
            <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
              Last {data.length} readings
            </div>
          </div>
          <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
            {unit}
          </div>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
              <Tooltip
                labelStyle={{ color: "#0F172A" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }}
              />
              {rangeMin != null && (
                <ReferenceLine y={rangeMin} stroke="#A3E635" strokeDasharray="4 4" label={{ position: "left", value: "Normal min", fill: "#64748B", fontSize: 10 }} />
              )}
              {rangeMax != null && (
                <ReferenceLine y={rangeMax} stroke="#A3E635" strokeDasharray="4 4" label={{ position: "left", value: "Normal max", fill: "#64748B", fontSize: 10 }} />
              )}
              <Area type="monotone" dataKey={dataKey} stroke="none" fill={color} fillOpacity={0.12} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AssessmentPage({ patientId: propPatientId }) {
  const [searchParams] = useSearchParams();
  const patientId = propPatientId || searchParams.get("patientId");

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeRangeMinutes, setTimeRangeMinutes] = useState(10);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchVitals = async () => {
      try {
        const [l, h] = await Promise.all([
          getLatestVitals(patientId), 
          getVitalsHistory(patientId)
        ]);
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
  }, [patientId]);

  const handleDownloadReport = async () => {
    try {
      const blob = await downloadAssessmentReport(patientId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NeuroNest_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download report failed:", err);
      setError((err && err.message) || "Failed to download report");
    }
  };

  const transformedHistory = useMemo(() => {
    if (!history || !history.length) return [];

    const cutoff = Date.now() - timeRangeMinutes * 60 * 1000;
    const filtered = history
      .filter((item) => {
        const d = parseTimestamp(item.ts);
        return d ? d.getTime() >= cutoff : false;
      })
      .slice(-60);

    return filtered
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
  }, [history, timeRangeMinutes]);

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

  const deviceStatus = useMemo(() => {
    if (!latest) return "Offline";
    if (latest.signal === "no_device") return "No Device Assigned";
    if (latest.signal === "ok") return "Connected";
    if (latest.signal === "weak") return "Weak Connection";
    return "Disconnected";
  }, [latest]);

  const vitalsSummary = useMemo(() => {
    if (!latest) return { critical: false, warning: false, messages: [] };

    const specs = [
      { key: "hr", value: latest.hr, label: "Heart rate" },
      { key: "spo2", value: latest.spo2, label: "SpO₂" },
      { key: "temp", value: latest.temp, label: "Temperature" },
    ];

    const messages = [];
    let critical = false;
    let warning = false;

    specs.forEach(({ key, value, label }) => {
      const status = statusForVital(key, value);
      if (status.level === "critical") {
        critical = true;
        messages.push(`⚠ ${label} ${value != null ? value : "--"} is critical`);
      } else if (status.level === "warning") {
        warning = true;
        messages.push(`⚠ ${label} ${value != null ? value : "--"} is outside normal range`);
      }
    });

    return { critical, warning, messages };
  }, [latest]);

  return (
    <div style={{ padding: "0 32px 32px" }}>
      <header style={{ padding: "24px 0" }}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Assessment
            </h1>
            <p style={{ margin: "8px 0 0", color: "#64748B" }}>
              Analyze vitals trends and generate a quick health summary based on recent readings.
            </p>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleDownloadReport}
            disabled={loading || latest?.signal === "no_device"}
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </header>

      <section className="mb-4">
        {latest?.signal === "no_device" && (
          <div className="alert alert-info rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 p-4 mb-4" style={{ background: "#F1F5F9", color: "#475569" }}>
            <div className="bg-white p-2 rounded-circle shadow-sm">
              <Activity size={24} className="text-secondary opacity-75" />
            </div>
            <div>
              <h3 className="h6 fw-bold mb-1">No Monitoring Device Assigned</h3>
              <p className="small mb-0 opacity-75">Real-time vital monitoring and clinical evaluation mapping are currently unavailable for this account.</p>
            </div>
          </div>
        )}

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Current Vitals Snapshot</h2>
            <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
              Last updated: {formatAgo(latest?.ts)}
            </div>
          </div>
          <div className="d-flex flex-column align-items-end text-end">
            <div className="badge rounded-pill" style={{ background: latest ? "#DCFCE7" : "#F8FAFC", color: latest ? "#166534" : "#64748B" }}>
              <Activity size={14} className="me-1" /> Device Status
            </div>
            <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
              {deviceStatus === "Connected" ? "🟢 ESP32 Sensor Connected" : deviceStatus}
            </div>
            <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
              Last Sync: {formatAgo(latest?.ts)}
            </div>
          </div>
        </div>

        {vitalsSummary.messages.length > 0 && (
          <div className="alert alert-warning rounded-4" role="alert" style={{ marginBottom: 24 }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fw-semibold">⚠ Patient vitals outside safe range</span>
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                Please review the latest readings.
              </span>
            </div>
            <ul className="mb-0 ps-4" style={{ fontSize: "0.9rem" }}>
              {vitalsSummary.messages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="row g-4 mt-3">
          <div className="col-12 col-md-4">
            <VitalCard
              title="Heart Rate"
              icon={<Heart size={18} />}
              value={latest?.hr}
              unit="BPM"
              status={statusForVital("hr", latest?.hr)}
              baseline={baseline.hr}
              trend={getTrendInfo(latest?.hr, baseline.hr)}
            />
          </div>
          <div className="col-12 col-md-4">
            <VitalCard
              title="Oxygen Saturation"
              icon={<Droplets size={18} />}
              value={latest?.spo2}
              unit="%"
              status={statusForVital("spo2", latest?.spo2)}
              baseline={baseline.spo2}
              trend={getTrendInfo(latest?.spo2, baseline.spo2)}
            />
          </div>
          <div className="col-12 col-md-4">
            <VitalCard
              title="Body Temperature"
              icon={<Thermometer size={18} />}
              value={latest?.temp}
              unit="°C"
              status={statusForVital("temp", latest?.temp)}
              baseline={baseline.temp}
              trend={getTrendInfo(latest?.temp, baseline.temp)}
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
              Time Range:
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: "180px" }}
              value={timeRangeMinutes}
              onChange={(e) => setTimeRangeMinutes(Number(e.target.value))}
            >
              <option value={10}>Last 10 min</option>
              <option value={30}>Last 30 min</option>
              <option value={60}>Last 60 min</option>
              <option value={1440}>Last 24 hours</option>
            </select>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <TrendChart
            title="Heart Rate Trend"
            data={transformedHistory}
            dataKey="hr"
            unit="BPM"
            color="#dc2626"
            rangeMin={60}
            rangeMax={100}
          />
          </div>
          <div className="col-12 col-lg-4">
            <TrendChart
              title="SpO₂ Trend"
              data={transformedHistory}
              dataKey="spo2"
              unit="%"
              color="#0d6efd"
              rangeMin={95}
              rangeMax={100}
            />
          </div>
          <div className="col-12 col-lg-4">
            <TrendChart
              title="Temperature Trend"
              data={transformedHistory}
              dataKey="temp"
              unit="°C"
              color="#16a34a"
              rangeMin={36.1}
              rangeMax={37.2}
            />
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
          <div className="d-flex flex-column align-items-end">
            <div className="badge rounded-pill" style={{ background: "#eef2ff", color: "#3730a3" }}>
              Score: {healthScore ?? "—"} / 100
            </div>
            <div className="mt-2 d-flex gap-2" style={{ fontSize: "0.75rem" }}>
              <span className="badge" style={{ background: "#DCFCE7", color: "#166534" }}>Normal</span>
              <span className="badge" style={{ background: "#FFEDD5", color: "#9a3412" }}>Warning</span>
              <span className="badge" style={{ background: "#FEE2E2", color: "#7f1d1d" }}>Critical</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h3 className="h6 fw-bold mb-3">Recent History</h3>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                <table className="table table-borderless table-hover mb-0">
                  <thead>
                    <tr>
                      <th className="text-secondary small" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                        Time
                      </th>
                      <th className="text-secondary small" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                        HR
                      </th>
                      <th className="text-secondary small" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                        SpO₂
                      </th>
                      <th className="text-secondary small" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                        Temp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transformedHistory.slice(0, 10).map((v, idx) => {
                      const hrStatus = statusForVital("hr", v.hr);
                      const spo2Status = statusForVital("spo2", v.spo2);
                      const tempStatus = statusForVital("temp", v.temp);
                      const isCritical = [hrStatus, spo2Status, tempStatus].some((s) => s.level === "critical");
                      const isWarning = [hrStatus, spo2Status, tempStatus].some((s) => s.level === "warning");
                      const rowStyle = {
                        borderBottom: "1px solid #F1F5F9",
                        background: isCritical ? "rgba(254,226,226,0.3)" : isWarning ? "rgba(255,247,237,0.5)" : "transparent",
                      };

                      return (
                        <tr key={idx} style={rowStyle}>
                          <td className="small text-secondary" style={{ width: 100 }}>{v.label}</td>
                          <td className="small" style={{ width: 80 }}>{v.hr ?? "--"}</td>
                          <td className="small" style={{ width: 80 }}>{v.spo2 ?? "--"}</td>
                          <td className="small" style={{ width: 80 }}>{v.temp ?? "--"}</td>
                        </tr>
                      );
                    })}
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
