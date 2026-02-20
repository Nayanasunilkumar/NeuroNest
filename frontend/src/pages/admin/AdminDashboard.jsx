import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin-dashboard.css';

const IconPatients = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const IconDoctors = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.1l.2.2c1.1 1.1 2.4 2.1 4 2.1h4c1.6 0 2.9-1 4-2.1l.2-.2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M15.8 11.3c.2.4.2.8.2 1.2 0 1-.5 1.8-1.2 2.1"/><path d="M8 11.3c-.2.4-.2.8-.2 1.2 0 1 .5 1.8 1.2 2.1"/><path d="M12 15v2"/><path d="M12 9v2"/><path d="M9 21h6"/></svg>
);

const IconAppointments = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const IconRevenue = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const IconAssessments = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

const IconPayments = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
);

const IconReviews = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Patients', value: '4,285', trend: '+12.4%', icon: <IconPatients />, color: 'blue' },
    { label: 'Active Doctors', value: '156', trend: '+5.1%', icon: <IconDoctors />, color: 'green' },
    { label: 'System Load', value: '24ms', trend: 'Stable', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, color: 'purple' },
    { label: 'Revenue (MTD)', value: '$12.5k', trend: '+18.2%', icon: <IconRevenue />, color: 'orange' },
  ];

  const modules = [
    { title: 'Manage Patients', desc: 'Securely access and update patient health records.', icon: <IconPatients />, path: '/admin/manage-patients' },
    { title: 'Manage Doctors', desc: 'Manage medical staff profiles and credentials.', icon: <IconDoctors />, path: '/admin/manage-doctors' },
    { title: 'Appointments', desc: 'Oversee scheduling across all departments.', icon: <IconAppointments />, path: '/admin/appointment-management' },
    { title: 'Assessments', desc: 'Analyze clinical outcomes and test results.', icon: <IconAssessments />, path: '/admin/assessment-management' },
    { title: 'Payments', desc: 'Automated billing and financial reconciliation.', icon: <IconPayments />, path: '/admin/payment-management' },
    { title: 'Reviews', desc: 'Monitor and respond to patient feedback.', icon: <IconReviews />, path: '/admin/review-management' },
  ];

  const activities = [
    { text: 'Auth node: Dr. Sarah Smith login established', time: '12:04:22', type: 'info' },
    { text: 'Patch 2.4.1 deployed to edge cluster', time: '11:45:10', type: 'success' },
    { text: 'Billing Cron: Monthly reports generated', time: '09:00:00', type: 'info' },
    { text: 'Access Denied: Multiple failed attempts from IP 192.x', time: '08:12:45', type: 'error' },
  ];

  const tasks = [
    { title: 'Credential Verification', desc: 'Dr. James Wilson (ID: 442)', priority: 'High' },
    { title: 'Fee Schedule Update', desc: 'Radiology department revisions', priority: 'Medium' },
    { title: 'SLA Audit', desc: 'Response time threshold analysis', priority: 'High' },
  ];

  const chartData = [
    { day: 'M', p: 80, s: 40 },
    { day: 'T', p: 120, s: 60 },
    { day: 'W', p: 150, s: 90 },
    { day: 'T', p: 100, s: 50 },
    { day: 'F', p: 170, s: 110 },
    { day: 'S', p: 60, s: 30 },
    { day: 'S', p: 40, s: 20 },
  ];

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-welcome-header">
        <div className="admin-welcome-text">
          <h1>System Overview</h1>
          <p>NeuroNest Enterprise Operations Console</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Internal Broadcast
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            <div className={`stat-trend ${stat.trend.startsWith('+') ? 'trend-up' : stat.trend === 'Stable' ? '' : 'trend-down'}`} style={{fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace'}}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-main-section" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginBottom: '1rem', gap: '1rem' }}>
        <div className="chart-card" style={{ border: '1px solid var(--console-border)', borderRadius: '4px' }}>
          <div className="chart-header">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Engagement Metrics</h3>
            <div className="chart-legend">
              <div className="legend-item"><span className="dot" style={{ background: 'var(--admin-accent)' }}></span> Intake</div>
              <div className="legend-item"><span className="dot" style={{ background: 'var(--admin-secondary)' }}></span> Outflow</div>
            </div>
          </div>
          <div className="bar-chart-mock">
            {chartData.map((data, i) => (
              <div key={i} className="chart-bar-group">
                <div className="bar-wrapper">
                  <div className="bar" style={{ height: `${data.p}%`, background: 'var(--admin-accent)' }} data-value={data.p}></div>
                  <div className="bar" style={{ height: `${data.s}%`, background: 'var(--admin-secondary)' }} data-value={data.s}></div>
                </div>
                <span className="bar-label" style={{fontFamily: 'monospace'}}>{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="task-card" style={{ border: '1px solid var(--console-border)', borderRadius: '4px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>Active Tasks</h3>
          <div className="task-list">
            {tasks.map((task, i) => (
              <div key={i} className="task-item">
                <div className="task-info">
                  <div className="task-text">
                    <h4 style={{fontSize: '0.85rem'}}>{task.title}</h4>
                    <p style={{fontSize: '0.75rem'}}>{task.desc}</p>
                  </div>
                </div>
                <span className={`priority-tag priority-${task.priority.toLowerCase()}`} style={{borderRadius: '2px', fontSize: '0.65rem'}}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-main-section" style={{gap: '1rem'}}>
        <div className="modules-section">
          <h2 className="section-title">Operations Nexus</h2>
          <div className="module-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'}}>
            {modules.map((mod, index) => (
              <Link to={mod.path} key={index} className="module-card">
                <div className="module-icon-wrap" style={{background: 'var(--admin-bg)', color: 'var(--admin-primary)'}}>
                  {mod.icon}
                </div>
                <div className="module-content">
                  <h3>{mod.title}</h3>
                  <p>{mod.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <h2 className="section-title">System Logs</h2>
          <div className="activity-card" style={{ border: '1px solid var(--console-border)', borderRadius: '4px' }}>
            <div className="activity-list">
              {activities.map((act, index) => (
                <div key={index} className="activity-item" style={{borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem'}}>
                  <div className="activity-details">
                    <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: act.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-text-main)' }}>
                      [{act.time}] {act.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="admin-btn" style={{width: '100%', justifyContent: 'center', marginTop: '1rem', background: 'transparent', fontSize: '0.75rem'}}>
              ACCESS FULL AUDIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
