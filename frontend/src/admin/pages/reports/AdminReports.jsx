import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from '../../../shared/services/api/axios';
import {
  Users, UserCheck, Activity, CalendarDays, CheckCircle2,
  XSquare, Clock, Star, Download, ChevronDown, Shield, FileJson, FileText
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import AppointmentCharts from './components/AppointmentCharts';
import DoctorPerformanceTable from './components/DoctorPerformanceTable';
import GovernancePanel from './components/GovernancePanel';
import '../../../admin/styles/admin-reports.css';
import { formatDateTimeIST, formatDateIST } from '../../../shared/utils/time';

// ─── Custom Hook ────────────────────────────────────────────────────────────
const useReports = (days) => {
  const [data, setData] = useState({
    overview: null,
    appointments: null,
    doctors: null,
    governance: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, appointmentsRes, doctorsRes, governanceRes] = await Promise.all([
        axios.get('/api/admin/reports/overview'),
        axios.get(`/api/admin/reports/appointments?days=${days}`),
        axios.get('/api/admin/reports/doctors'),
        axios.get(`/api/admin/reports/governance?days=${days}`),
      ]);
      setData({
        overview: overviewRes.data,
        appointments: appointmentsRes.data.daily_trends,
        doctors: doctorsRes.data,
        governance: governanceRes.data,
      });
    } catch (err) {
      const msg = err.response
        ? `${err.response.status} — ${JSON.stringify(err.response.data)}`
        : err.message;
      setError(msg);
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
};

// ─── Chart colour tokens ─────────────────────────────────────────────────────
const COLORS = {
  completed: '#10b981',
  pending:   '#f59e0b',
  cancelled: '#f43f5e',
  total:     '#6366f1',
  grid:      '#e2e8f0',
  text:      '#64748b',
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ar-tooltip">
      <p className="ar-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="ar-tooltip-row">
          <span>{p.name}</span>
          <span className="ar-tooltip-val">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Appointment trend chart ──────────────────────────────────────────────────
const TrendChart = ({ data }) => {
  if (!data?.length) return <div className="ar-no-data">No trend data available</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.completed} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.completed} stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.total} stopOpacity={0.2} />
            <stop offset="95%" stopColor={COLORS.total} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: COLORS.text, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: COLORS.text, fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 12, color: COLORS.text }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Total"
          stroke={COLORS.total}
          strokeWidth={2}
          fill="url(#gradTotal)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke={COLORS.completed}
          strokeWidth={2}
          fill="url(#gradCompleted)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Bar dataKey="cancelled" name="Cancelled" fill={COLORS.cancelled} radius={[3, 3, 0, 0]} opacity={0.75} barSize={8} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// ─── Doctor radar chart ───────────────────────────────────────────────────────
const DoctorRadar = ({ doctors }) => {
  if (!doctors?.length) return <div className="ar-no-data">No doctor data available</div>;

  // Take top 6 doctors; build radar dimensions
  const top = doctors.slice(0, 6);
  const radarData = [
    { metric: 'Appointments', ...Object.fromEntries(top.map((d) => [d.name?.split(' ')[1] || d.name, d.total_appointments || 0])) },
    { metric: 'Completed',    ...Object.fromEntries(top.map((d) => [d.name?.split(' ')[1] || d.name, d.completed || 0]))          },
    { metric: 'Rating',       ...Object.fromEntries(top.map((d) => [d.name?.split(' ')[1] || d.name, (d.avg_rating || 0) * 20]))  },
    { metric: 'Pending',      ...Object.fromEntries(top.map((d) => [d.name?.split(' ')[1] || d.name, d.pending || 0]))            },
    { metric: 'Response',     ...Object.fromEntries(top.map((d) => [d.name?.split(' ')[1] || d.name, d.response_rate || 0]))      },
  ];

  const RADAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 0, left: 24 }}>
        <PolarGrid stroke={COLORS.grid} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: COLORS.text, fontSize: 11 }} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, color: COLORS.text }} />
        {top.map((d, i) => {
          const key = d.name?.split(' ')[1] || d.name;
          return (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
              fill={RADAR_COLORS[i % RADAR_COLORS.length]}
              fillOpacity={0.1}
              strokeWidth={1.5}
            />
          );
        })}
      </RadarChart>
    </ResponsiveContainer>
  );
};

// ─── Status breakdown bar chart ───────────────────────────────────────────────
const StatusBar = ({ overview }) => {
  if (!overview) return null;
  const { total, completed, pending, cancelled } = overview.appointments;
  const data = [
    { name: 'Completed', value: completed, fill: COLORS.completed },
    { name: 'Pending',   value: pending,   fill: COLORS.pending   },
    { name: 'Cancelled', value: cancelled, fill: COLORS.cancelled },
  ];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fill: COLORS.text, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fill: COLORS.text, fontSize: 12 }} tickLine={false} axisLine={false} width={72} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, i) => (
            <rect key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── KPI card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, Icon, color }) => (
  <div className={`ar-kpi theme-${color}`}>
    <div className="ar-kpi-icon">
      <Icon size={20} strokeWidth={1.8} />
    </div>
    <div className="ar-kpi-body">
      <span className="ar-kpi-label">{label}</span>
      <span className="ar-kpi-value">{value ?? '—'}</span>
    </div>
  </div>
);

// ─── Export helpers ───────────────────────────────────────────────────────────
const EXPORT_OPTIONS = [
  { format: 'json', label: 'JSON Archive',          Icon: FileJson,  accent: '#6366f1' },
  { format: 'pdf',  label: 'PDF Document',          Icon: FileText,  accent: '#f59e0b' },
  { format: 'csv',  label: 'Governance Audit (CSV)', Icon: Shield,   accent: '#10b981' },
];

// ─── Main component ──────────────────────────────────────────────────────────
const AdminReports = () => {
  const [days, setDays] = useState(7);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  const { overview, appointments, doctors, governance, loading, error } = useReports(days);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = useCallback(async (format) => {
    if (!overview || !appointments || !doctors || !governance) return;
    setExporting(true);
    const now = new Date();
    const dateSlug = formatDateIST(now).replace(/\//g, '-');

    try {
      if (format === 'json') {
        const blob = new Blob(
          [JSON.stringify({ generated_at: formatDateTimeIST(now), period_days: days, overview, appointments, doctors, governance }, null, 2)],
          { type: 'application/json' }
        );
        triggerDownload(URL.createObjectURL(blob), `enterprise_report_${days}d_${dateSlug}.json`);

      } else if (format === 'pdf') {
        const element = document.getElementById('admin-reports-content');
        const actions  = document.getElementById('reports-header-actions');
        if (actions) actions.style.display = 'none';
        const { default: html2pdf } = await import('html2pdf.js');
        await html2pdf().set({
          margin: 10,
          filename: `enterprise_report_${days}d_${dateSlug}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        }).from(element).save();
        if (actions) actions.style.display = 'flex';

      } else if (format === 'csv') {
        const res = await axios.get(`/api/admin/reports/governance-audit?days=${days}`);
        const rows = res.data;
        if (!rows?.length) { alert('No governance audit data for the selected period.'); return; }
        const headers = ['ID', 'Action', 'Admin', 'Note', 'Review ID', 'Timestamp'];
        const csv = [
          headers.join(','),
          ...rows.map((r) => [
            r.id, r.action, r.admin,
            `"${(r.note || '').replace(/"/g, '""')}"`,
            r.review_id, r.timestamp,
          ].join(',')),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        triggerDownload(URL.createObjectURL(blob), `governance_audit_${days}d_${dateSlug}.csv`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  }, [overview, appointments, doctors, governance, days]);

  const triggerDownload = (href, filename) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // KPI stat cards config — memoised so it only recalculates when overview changes
  const statCards = useMemo(() => overview ? [
    { label: 'Total Patients',      value: overview.users.total_patients,        Icon: Users,         color: 'blue'    },
    { label: 'Active Doctors',      value: overview.users.total_doctors,          Icon: UserCheck,     color: 'emerald' },
    { label: 'All Appointments',    value: overview.appointments.total,           Icon: Activity,      color: 'violet'  },
    { label: 'Appointments Today',  value: overview.appointments.today,           Icon: CalendarDays,  color: 'fuchsia' },
    { label: 'Completed Sessions',  value: overview.appointments.completed,       Icon: CheckCircle2,  color: 'teal'    },
    { label: 'Pending Approvals',   value: overview.appointments.pending,         Icon: Clock,         color: 'amber'   },
    { label: 'Cancellations',       value: overview.appointments.cancelled,       Icon: XSquare,       color: 'rose'    },
    { label: 'Platform Rating',     value: overview.reviews.average_rating,       Icon: Star,          color: 'yellow'  },
  ] : [], [overview]);

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="ar-error-state">
        <Shield size={40} strokeWidth={1.5} />
        <h3>Failed to load dashboard</h3>
        <pre>{error}</pre>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-reports-root">

      {/* ── Header ── */}
      <div className="admin-reports-header">
        <div className="header-top">
          <div className="header-titles">
            <h1>Enterprise Analytics <span className="ar-amp">&amp;</span> Governance</h1>
            <p>Live system metrics, performance monitoring, and compliance oversight.</p>
            <div className="ar-last-updated">
              <Clock size={12} strokeWidth={2.5} />
              Last synchronized: {formatDateTimeIST(new Date())}
            </div>
          </div>

          {/* Export dropdown */}
          <div className="ar-export-wrap" ref={exportRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu((v) => !v)}
              className={`btn-export-trigger ${showExportMenu ? 'active' : ''}`}
              disabled={exporting}
            >
              <Download size={15} strokeWidth={2.5} />
              <span>{exporting ? 'Exporting…' : 'Export Report'}</span>
              <ChevronDown
                size={14}
                strokeWidth={2.5}
                style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}
              />
            </button>

            {showExportMenu && (
              <div className="ar-export-menu">
                <p className="ar-export-header">Choose format</p>
                {EXPORT_OPTIONS.map(({ format, label, Icon, accent }) => (
                  <button
                    key={format}
                    type="button"
                    className="ar-export-option"
                    onClick={() => handleExport(format)}
                  >
                    <span className="ar-export-icon" style={{ color: accent, background: `${accent}18` }}>
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Time range chips */}
        <div id="reports-header-actions" className="header-actions">
          <span className="filter-label">Time Range</span>
          <div className="toggle-chips-container">
            {[7, 15, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`toggle-chip ${days === d ? 'active' : ''}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className="ar-skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ar-skeleton-card" />
          ))}
          <div className="ar-skeleton-chart col-span-2" />
          <div className="ar-skeleton-chart" />
        </div>
      ) : (
        <div id="admin-reports-content">
          {/* Live Monitoring Pulse */}
          <div className="ar-live-pulse">
            <span className="ar-pulse-dot" />
            Live System Monitoring Active
          </div>

          {/* ── KPI grid ── */}
          <div className="ar-kpi-grid">
            {statCards.map((s, i) => (
              <KpiCard key={i} {...s} />
            ))}
          </div>

          {/* ── Chart row 1: trend + status breakdown ── */}
          <div className="ar-bento-grid">
            <div className="ar-bento-box ar-col-2">
              <div className="ar-bento-header">
                <div>
                  <h3>Appointment Velocity</h3>
                  <p className="ar-bento-sub">Daily trend — completed, total &amp; cancellations</p>
                </div>
                <span className="ar-badge ar-badge-info">Volumetric</span>
              </div>
              <TrendChart data={appointments} />
            </div>

            <div className="ar-bento-box">
              <div className="ar-bento-header">
                <div>
                  <h3>Status Breakdown</h3>
                  <p className="ar-bento-sub">Aggregate across all time</p>
                </div>
                <span className="ar-badge ar-badge-warning">Distribution</span>
              </div>
              <StatusBar overview={overview} />
            </div>
          </div>

          {/* ── Chart row 2: doctor radar + governance ── */}
          <div className="ar-bento-grid">
            <div className="ar-bento-box">
              <div className="ar-bento-header">
                <div>
                  <h3>Doctor Performance Radar</h3>
                  <p className="ar-bento-sub">Top 6 doctors across 5 dimensions</p>
                </div>
                <span className="ar-badge ar-badge-success">Efficiency</span>
              </div>
              <DoctorRadar doctors={doctors} />
            </div>

            <div className="ar-bento-box ar-col-2">
              <div className="ar-bento-header">
                <div>
                  <h3>Risk &amp; Oversight Summary</h3>
                  <p className="ar-bento-sub">Governance events in selected period</p>
                </div>
                <span className="ar-badge ar-badge-danger">Security</span>
              </div>
              <GovernancePanel data={governance} />
            </div>
          </div>

          {/* ── Doctor performance table ── */}
          <div className="ar-bento-box ar-mt">
            <div className="ar-bento-header">
              <div>
                <h3>Clinical Force Performance Matrix</h3>
                <p className="ar-bento-sub">Full doctor breakdown — sortable</p>
              </div>
              <span className="ar-badge ar-badge-info">Full Roster</span>
            </div>
            <DoctorPerformanceTable doctors={doctors} />
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminReports;
