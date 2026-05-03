import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Clock3,
  Megaphone,
  Radio,
  Settings,
  Users,
  UserPlus,
  Calendar,
} from 'lucide-react';
import { adminDashboardApi } from '../../shared/services/adminDashboardApi';
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
      </div>
    </div>
  );
};

export default AdminDashboard;
