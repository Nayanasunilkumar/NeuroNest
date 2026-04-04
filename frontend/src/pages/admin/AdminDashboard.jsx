import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Megaphone,
  Radio,
  Settings,
  ShieldAlert,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { adminDashboardApi } from '../../api/adminDashboardApi';
import './AdminDashboard.css';

const STAT_META = {
  patients: {
    icon: Users,
    tone: 'sky',
    accent: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
  },
  doctors: {
    icon: UserPlus,
    tone: 'teal',
    accent: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
  },
  appointments: {
    icon: Calendar,
    tone: 'amber',
    accent: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
  },
  today_appointments: {
    icon: Clock3,
    tone: 'violet',
    accent: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
  },
  default: {
    icon: Activity,
    tone: 'slate',
    accent: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)',
  },
};

const MODULES = [
  {
    title: 'Manage Patients',
    desc: 'Access patient records, account states, and care-facing identity details.',
    icon: Users,
    path: '/admin/manage-patients',
    tone: 'sky',
  },
  {
    title: 'Manage Doctors',
    desc: 'Review provider profiles, staffing quality, and platform readiness.',
    icon: UserPlus,
    path: '/admin/manage-doctors',
    tone: 'teal',
  },
  {
    title: 'Appointments',
    desc: 'Monitor scheduling flow, conflicts, and daily service throughput.',
    icon: Calendar,
    path: '/admin/appointment-management',
    tone: 'amber',
  },
  {
    title: 'Assessments',
    desc: 'Track clinical assessments, reports, and outcome visibility.',
    icon: FileText,
    path: '/admin/assessment-management',
    tone: 'indigo',
  },
  {
    title: 'Reviews',
    desc: 'Moderate patient feedback and surface experience patterns early.',
    icon: Star,
    path: '/admin/review-management',
    tone: 'violet',
  },
  {
    title: 'Governance',
    desc: 'Handle escalations, operational risk, and sensitive intervention cases.',
    icon: ShieldAlert,
    path: '/admin/governance/queue',
    tone: 'rose',
  },
];

const EMPTY_CHART_BARS = [
  { day: 'Mon', p: 0, s: 0 },
  { day: 'Tue', p: 0, s: 0 },
  { day: 'Wed', p: 0, s: 0 },
  { day: 'Thu', p: 0, s: 0 },
  { day: 'Fri', p: 0, s: 0 },
  { day: 'Sat', p: 0, s: 0 },
  { day: 'Sun', p: 0, s: 0 },
];

const PRIORITY_META = {
  High: { label: 'High', tone: 'critical' },
  Medium: { label: 'Medium', tone: 'watch' },
  Low: { label: 'Low', tone: 'calm' },
  default: { label: 'Routine', tone: 'neutral' },
};

const clampPercent = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
};

const normalizeChartData = (chartData = []) => {
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return EMPTY_CHART_BARS;
  }

  return chartData.map((item, index) => ({
    day: item.day || `Day ${index + 1}`,
    p: clampPercent(item.p),
    s: clampPercent(item.s),
  }));
};

const normalizeTrend = (trend) => {
  if (!trend) return { label: 'Live', tone: 'neutral' };
  if (String(trend).startsWith('+')) return { label: trend, tone: 'positive' };
  if (String(trend).startsWith('-')) return { label: trend, tone: 'negative' };
  return { label: trend, tone: 'neutral' };
};

const AdminDashboard = () => {
  const [data, setData] = useState({
    stats: [],
    activities: [],
    tasks: [],
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminDashboardApi.getDashboardSummary();
      setData({
        stats: response.stats || [],
        activities: response.activities || [],
        tasks: response.tasks || [],
        chartData: response.chartData || [],
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const chartBars = useMemo(() => normalizeChartData(data.chartData), [data.chartData]);
  const intakePeak = useMemo(() => Math.max(0, ...chartBars.map((item) => item.p)), [chartBars]);
  const outflowPeak = useMemo(() => Math.max(0, ...chartBars.map((item) => item.s)), [chartBars]);
  const highPriorityCount = useMemo(
    () => data.tasks.filter((task) => String(task.priority).toLowerCase() === 'high').length,
    [data.tasks],
  );

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-shell admin-dashboard-shell-loading">
          <div className="admin-dashboard-loader" aria-hidden="true" />
          <p>Synchronizing admin operations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-shell admin-dashboard-shell-error">
          <div className="admin-dashboard-error-icon">
            <AlertCircle size={34} />
          </div>
          <h1>Dashboard unavailable</h1>
          <p>{error}</p>
          <button type="button" onClick={fetchDashboardData} className="admin-dashboard-primary-btn">
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <section className="admin-dashboard-hero">
          <div className="admin-dashboard-hero-copy">
            <span className="admin-dashboard-kicker">Admin command center</span>
            <h1>Operational clarity for the entire platform</h1>
            <p>
              Keep patient volume, provider readiness, scheduling flow, and governance actions in one
              clean control surface.
            </p>

            <div className="admin-dashboard-hero-actions">
              <Link to="/admin/announcements" className="admin-dashboard-primary-btn">
                <Megaphone size={16} />
                Open announcements
              </Link>
              <Link to="/admin/settings" className="admin-dashboard-secondary-btn">
                <Settings size={16} />
                Review settings
              </Link>
            </div>
          </div>

          <div className="admin-dashboard-hero-panel">
            <div className="admin-dashboard-live-pill">
              <Radio size={14} />
              Live operations
            </div>

            <div className="admin-dashboard-hero-grid">
              <article className="admin-dashboard-hero-stat">
                <span className="admin-dashboard-hero-label">Tracked metrics</span>
                <strong>{data.stats.length}</strong>
                <p>Core KPIs streaming from the admin summary endpoint.</p>
              </article>

              <article className="admin-dashboard-hero-stat">
                <span className="admin-dashboard-hero-label">Open tasks</span>
                <strong>{data.tasks.length}</strong>
                <p>{highPriorityCount} marked high priority right now.</p>
              </article>

              <article className="admin-dashboard-hero-stat admin-dashboard-hero-stat-wide">
                <span className="admin-dashboard-hero-label">Recent activity</span>
                <strong>{data.activities.length}</strong>
                <p>
                  {data.activities.length
                    ? 'System events are flowing into the dashboard timeline.'
                    : 'No recent system events have been published yet.'}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-stats-grid">
          {data.stats.map((stat, index) => {
            const meta = STAT_META[stat.id] || STAT_META.default;
            const Icon = meta.icon;
            const trend = normalizeTrend(stat.trend);

            return (
              <article
                key={`${stat.id || stat.label}-${index}`}
                className="admin-dashboard-stat-card"
                style={{ '--admin-dashboard-accent': meta.accent }}
              >
                <div className="admin-dashboard-stat-top">
                  <div className={`admin-dashboard-stat-icon tone-${meta.tone}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`admin-dashboard-trend-pill is-${trend.tone}`}>{trend.label}</span>
                </div>

                <span className="admin-dashboard-stat-label">{stat.label}</span>
                <strong className="admin-dashboard-stat-value">{stat.value}</strong>
              </article>
            );
          })}
        </section>

        <section className="admin-dashboard-main-grid">
          <article className="admin-dashboard-panel admin-dashboard-panel-chart">
            <div className="admin-dashboard-panel-head">
              <div>
                <span className="admin-dashboard-section-kicker">Throughput</span>
                <h2>Engagement metrics</h2>
              </div>
              <div className="admin-dashboard-legend">
                <span><i className="is-intake" /> Intake</span>
                <span><i className="is-outflow" /> Outflow</span>
              </div>
            </div>

            {data.chartData.length ? (
              <>
                <div className="admin-dashboard-chart-summary">
                  <div>
                    <span>Peak intake</span>
                    <strong>{intakePeak}%</strong>
                  </div>
                  <div>
                    <span>Peak outflow</span>
                    <strong>{outflowPeak}%</strong>
                  </div>
                </div>

                <div className="admin-dashboard-chart">
                  <div className="admin-dashboard-chart-grid" aria-hidden="true">
                    {[0, 1, 2, 3].map((item) => (
                      <span key={item} />
                    ))}
                  </div>

                  {chartBars.map((item) => (
                    <div key={item.day} className="admin-dashboard-chart-col">
                      <div className="admin-dashboard-chart-bars">
                        <div
                          className="admin-dashboard-bar is-intake"
                          style={{ height: `${item.p}%` }}
                          title={`${item.day} intake ${item.p}%`}
                        />
                        <div
                          className="admin-dashboard-bar is-outflow"
                          style={{ height: `${item.s}%` }}
                          title={`${item.day} outflow ${item.s}%`}
                        />
                      </div>
                      <span>{item.day}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="admin-dashboard-empty-state">
                <Activity size={18} />
                <p>No throughput history is available yet.</p>
              </div>
            )}
          </article>

          <article className="admin-dashboard-panel admin-dashboard-panel-queue">
            <div className="admin-dashboard-panel-head">
              <div>
                <span className="admin-dashboard-section-kicker">Queue</span>
                <h2>Task pipeline</h2>
              </div>
            </div>

            <div className="admin-dashboard-queue-list">
              {data.tasks.length ? (
                data.tasks.map((task, index) => {
                  const meta = PRIORITY_META[task.priority] || PRIORITY_META.default;
                  return (
                    <div key={`${task.title}-${index}`} className={`admin-dashboard-task tone-${meta.tone}`}>
                      <div className="admin-dashboard-task-top">
                        <h3>{task.title}</h3>
                        <span>{meta.label}</span>
                      </div>
                      <p>{task.desc}</p>
                    </div>
                  );
                })
              ) : (
                <div className="admin-dashboard-empty-state">
                  <CheckCircle2 size={18} />
                  <p>No active admin tasks are waiting right now.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="admin-dashboard-lower-grid">
          <article className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-head">
              <div>
                <span className="admin-dashboard-section-kicker">Workspace</span>
                <h2>Administrative modules</h2>
              </div>
              <Link to="/admin/settings" className="admin-dashboard-icon-link" aria-label="Open settings">
                <Settings size={16} />
              </Link>
            </div>

            <div className="admin-dashboard-module-grid">
              {MODULES.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.title} to={module.path} className={`admin-dashboard-module-card tone-${module.tone}`}>
                    <div className="admin-dashboard-module-icon">
                      <Icon size={20} />
                    </div>
                    <div className="admin-dashboard-module-copy">
                      <h3>{module.title}</h3>
                      <p>{module.desc}</p>
                    </div>
                    <ChevronRight size={18} className="admin-dashboard-module-arrow" />
                  </Link>
                );
              })}
            </div>
          </article>

          <article className="admin-dashboard-panel">
            <div className="admin-dashboard-panel-head">
              <div>
                <span className="admin-dashboard-section-kicker">Timeline</span>
                <h2>Recent system activity</h2>
              </div>
              <Link to="/admin/reports-analytics" className="admin-dashboard-inline-link">
                Audit view
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="admin-dashboard-activity-list">
              {data.activities.length ? (
                data.activities.map((activity, index) => (
                  <div key={`${activity.time}-${index}`} className="admin-dashboard-activity-item">
                    <div className={`admin-dashboard-activity-dot is-${activity.type === 'error' ? 'error' : 'success'}`} />
                    <div className="admin-dashboard-activity-copy">
                      <div className="admin-dashboard-activity-meta">
                        <span>{activity.time || 'System'}</span>
                        <strong>{activity.type === 'error' ? 'Failure' : 'Nominal'}</strong>
                      </div>
                      <p>{activity.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-dashboard-empty-state">
                  <Clock3 size={18} />
                  <p>No recent activity has been recorded yet.</p>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
