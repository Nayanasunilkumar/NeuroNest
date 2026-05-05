import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  Clock3, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  Settings2,
  Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../shared/services/api/notificationApi';

const AdminNotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('unresolved'); // all, unread, unresolved, critical, system
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Mark read failed:', error);
    }
  };
  
  const handleMarkResolved = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsResolved(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_resolved: true, is_read: true } : n));
      
      const notif = notifications.find(n => n.id === id);
      const doctorId = notif?.metadata?.doctor_id;
      const userId = notif?.metadata?.user_id;

      if (doctorId) {
        navigate(`/admin/governance/doctor/${doctorId}`);
      } else if (userId) {
        // If it's a security anomaly, we can navigate to the patient profile or just stay here
        // For now, let's keep it here but we could add a security log page
      }
    } catch (error) {
      console.error('Mark resolved failed:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // Forced refresh to ensure server sync
      setTimeout(fetchNotifications, 500);
    } catch (error) {
      console.error('Mark all read failed:', error);
      alert('Failed to mark notifications as read. Please check your connection.');
    }
  };

  const getNotifIcon = (type, severity) => {
    if (severity === 'critical' || type === 'escalation') return <ShieldAlert size={20} className="text-rose-500" />;
    if (type === 'credentialing') return <ShieldCheck size={20} className="text-blue-500" />;
    if (type === 'system') return <Activity size={20} className="text-amber-500" />;
    if (type === 'appointment_conflict' || type === 'appointment') return <AlertTriangle size={20} className="text-orange-500" />;
    return <Bell size={20} className="text-slate-400" />;
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const title = (n.title || "").toLowerCase();
      const message = (n.message || n.content || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = title.includes(search) || message.includes(search);
      
      const type = n.type || '';
      const category = n.metadata?.category || '';
      const severity = n.metadata?.severity || '';

      const matchesType = filterType === 'all' || 
                         (filterType === 'unread' && !n.is_read) ||
                         (filterType === 'unresolved' && !n.is_resolved) ||
                         (filterType === 'critical' && severity === 'critical') ||
                         (filterType === 'escalations' && (type === 'escalation' || category === 'escalation')) ||
                         (filterType === 'credentialing' && type === 'credentialing') ||
                         (filterType === 'appointments' && (type === 'appointment_conflict' || type === 'appointment'));
      
      return matchesSearch && matchesType;
    });
  }, [notifications, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const displayedNotifications = filteredNotifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleAction = (notif) => {
    const type = (notif.type || '').toLowerCase();
    const category = (notif.metadata?.category || '').toLowerCase();
    const title = (notif.title || '').toLowerCase();

    if (type === 'escalation' || category === 'escalation' || title.includes('escalation')) {
      const doctorId = notif.metadata?.doctor_id;
      if (doctorId) {
        navigate(`/admin/governance/doctor/${doctorId}`);
      } else {
        navigate('/admin/review-management');
      }
    } else if (type === 'credentialing' || type === 'doctor_verification' || title.includes('credential')) {
      navigate('/admin/manage-doctors');
    } else if (type === 'appointment_conflict' || type === 'appointment' || title.includes('appointment')) {
      navigate('/admin/appointment-management');
    } else {
      // Fallback to dashboard if type is unknown
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="admin-notif-center-wrapper">
      <div className="admin-notif-center-header">
        <div className="admin-notif-center-titlebox">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs fw-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Global Governance Active</span>
          </div>
          <h1>Administrative Nexus</h1>
          <p>Institutional audit center for real-time governance monitoring</p>
        </div>
        <div className="admin-notif-center-actions">
          <button 
            onClick={handleMarkAllAsRead}
            className="nexus-header-btn"
          >
            <Check size={14} /> 
            Mark All Read
          </button>
          <button 
            onClick={fetchNotifications}
            className="nexus-header-btn primary"
          >
            <Activity size={14} />
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Executive Summary Stats */}
      <div className="nexus-executive-summary">
        <div className="summary-card">
          <span className="summary-label">Total Intelligence</span>
          <span className="summary-value">{notifications.length}</span>
          <div className="summary-footer">System-wide logs</div>
        </div>
        <div className="summary-card">
          <span className="summary-label">Awaiting Resolution</span>
          <span className="summary-value text-blue-600">{notifications.filter(n => !n.is_resolved).length}</span>
          <div className="summary-footer">Pending administrative action</div>
        </div>
        <div className="summary-card urgent">
          <span className="summary-label text-rose-500">Critical Alerts</span>
          <span className="summary-value text-rose-600">{notifications.filter(n => n.metadata?.severity === 'critical' && !n.is_resolved).length}</span>
          <div className="summary-footer">Immediate resolution required</div>
        </div>
        <div className="summary-card">
          <span className="summary-label">Health Status</span>
          <span className="summary-value text-emerald-600">OPTIMAL</span>
          <div className="summary-footer">All systems operational</div>
        </div>
      </div>

      <div className="nexus-main-deck">
        {/* Toolbar */}
        <div className="nexus-control-bar">
          <div className="nexus-search-wrap">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search through intelligence logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="nexus-filter-strip">
            {['all', 'unresolved', 'unread', 'critical', 'escalations', 'credentialing', 'appointments'].map(type => {
              const count = type === 'unread' ? notifications.filter(n => !n.is_read).length : 
                            type === 'unresolved' ? notifications.filter(n => !n.is_resolved).length : 0;
              return (
                <button
                  key={type}
                  onClick={() => { setFilterType(type); setPage(1); }}
                  className={`nexus-strip-pill ${filterType === type ? 'active' : ''}`}
                >
                  {type === 'unresolved' ? 'Pending Actions' : type}
                  {count > 0 && <span className="pill-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pool */}
        <div className="nexus-records-pool">
          {loading ? (
            <div className="nexus-syncing-state">
              <div className="syncing-spinner" />
              <p>Synchronizing Global Nexus Feed...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="nexus-zero-state">
              <div className="zero-state-icon-wrap">
                {filterType === 'unread' ? <CheckCircle size={48} /> : <ShieldCheck size={48} />}
              </div>
              <h3>{filterType === 'unread' ? 'All Alerts Seen' : 'Nexus Clear'}</h3>
              <p>
                {filterType === 'unread' ? 'You have reviewed all incoming intelligence logs.' : 
                 filterType === 'unresolved' ? 'Outstanding cases have been successfully mitigated.' :
                 'No records found matching your current institutional filters.'}
              </p>
              {filterType !== 'all' && (
                <button onClick={() => setFilterType('all')} className="nexus-zero-btn">
                  View All History
                </button>
              )}
            </div>
          ) : (
            <div className="nexus-record-stack">
              {displayedNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`nexus-record-item ${notif.is_read ? 'is-read' : 'is-unread'} severity-${notif.metadata?.severity || 'info'}`}
                >
                  <div className="record-visual">
                    <div className="icon-vault">
                      {getNotifIcon(notif.type, notif.metadata?.severity)}
                    </div>
                  </div>
                  
                  <div className="record-main">
                    <div className="record-head">
                      <div className="flex items-center gap-3">
                        <h4 className="record-title">{notif.title}</h4>
                        {notif.metadata?.severity === 'critical' && (
                          <span className="record-tag-critical">CRITICAL</span>
                        )}
                        {notif.is_resolved && (
                          <span className="record-tag-resolved">RESOLVED</span>
                        )}
                      </div>
                      <div className="record-timestamp">
                        <Clock3 size={12} />
                        {formatRelativeTime(notif.created_at)}
                      </div>
                    </div>
                    
                    <p className="record-message">
                      {(notif.message || notif.content || "").replace(/Dr\.\s*Dr\./g, 'Dr.')}
                    </p>

                    {notif.metadata?.stats && (
                      <div className="record-telemetry">
                        <div className="telemetry-box">
                          <span className="label">Department</span>
                          <span className="value">{notif.metadata.department || 'General Governance'}</span>
                        </div>
                        <div className="telemetry-box">
                          <span className="label">Risk Impact</span>
                          <span className={`value ${notif.metadata.severity === 'critical' ? 'text-rose-600' : ''}`}>
                            {notif.metadata.risk_level?.toUpperCase() || 'MODERATE'}
                          </span>
                        </div>
                        {notif.metadata?.stats?.complaints > 0 && (
                          <div className="telemetry-box">
                            <span className="label">Incident Volume</span>
                            <span className="value">{(Number(notif.metadata.stats.complaints) || 0)} Reports</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="record-actions-dock">
                    {notif.type === 'escalation' || notif.type === 'system' || notif.metadata?.severity === 'critical' ? (
                      <button 
                        onClick={(e) => handleMarkResolved(notif.id, e)}
                        className={`dock-btn ${notif.is_resolved ? 'success' : 'primary'}`}
                        disabled={notif.is_resolved}
                      >
                        {notif.is_resolved ? <><Check size={14} /> Resolved</> : 'Mark as Resolved'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction(notif)}
                        className="dock-btn primary"
                      >
                        Review Case
                        <ExternalLink size={12} />
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className={`dock-btn ${notif.is_read ? 'success' : 'secondary'}`}
                      disabled={notif.is_read}
                    >
                      {notif.is_read ? (
                        <><Check size={14} /> Read</>
                      ) : (
                        'Mark as Read'
                      )}
                    </button>
                    {!notif.is_read && (
                      <button 
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="dock-btn danger"
                        title="Archive Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Dashboard */}
        {totalPages > 1 && (
          <div className="nexus-pagination-deck">
            <div className="pagination-info">
              Showing <strong>{(page - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(page * itemsPerPage, filteredNotifications.length)}</strong> of <strong>{filteredNotifications.length}</strong> Intelligence Logs
            </div>
            <div className="pagination-controls">
              <button className="page-nav-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={18} />
              </button>
              <div className="page-bullets">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={page === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button className="page-nav-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-notif-center-wrapper {
          padding: 3rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
          animation: nexusPageIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes nexusPageIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .admin-notif-center-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
        }

        .admin-notif-center-titlebox h1 {
          font-size: 2.75rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.04em;
        }

        .admin-notif-center-titlebox p {
          color: #64748b;
          font-size: 1.15rem;
          font-weight: 500;
          margin: 4px 0 0;
        }

        .admin-notif-center-actions {
          display: flex;
          gap: 12px;
        }

        .nexus-header-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
        }

        .nexus-header-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .nexus-header-btn.primary {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .nexus-header-btn.primary:hover {
          background: #1d4ed8;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        }

        /* Executive Summary Grid */
        .nexus-executive-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 3rem;
        }

        .summary-card {
          background: white;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }

        .summary-card.urgent {
          border-color: #fecdd3;
          background: #fffbfa;
        }

        .summary-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 900;
          color: #0f172a;
        }

        .summary-footer {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* Main Deck */
        .nexus-main-deck {
          background: white;
          border-radius: 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .nexus-control-bar {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
          background: #fcfdfe;
        }

        .nexus-search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f1f5f9;
          padding: 12px 20px;
          border-radius: 18px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .nexus-search-wrap:focus-within {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }

        .nexus-search-wrap input {
          border: 0;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .nexus-filter-strip {
          display: flex;
          gap: 6px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 14px;
        }

        .nexus-strip-pill {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          border: 0;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nexus-strip-pill.active {
          background: white;
          color: #0f172a;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        .pill-badge {
          background: #2563eb;
          color: white;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .nexus-record-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 32px;
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .nexus-record-item:hover {
          background: #f8fafc;
        }

        .nexus-record-item.is-unread {
          background: rgba(37, 99, 235, 0.01);
          border-left: 4px solid #2563eb;
        }

        .record-visual {
          display: flex;
          align-items: flex-start;
          padding-top: 4px;
        }

        .icon-vault {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .record-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .record-title {
          font-size: 1.25rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .record-timestamp {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .record-message {
          font-size: 1rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 16px 0;
          max-width: 800px;
        }

        .record-telemetry {
          display: flex;
          gap: 24px;
        }

        .telemetry-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .telemetry-box .label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .telemetry-box .value {
          font-size: 0.9rem;
          font-weight: 800;
          color: #334155;
        }

        .record-actions-dock {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 160px;
        }

        .dock-btn {
          width: 100%;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
        }

        .dock-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .dock-btn.primary {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .dock-btn.primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .dock-btn.success {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }

        .dock-btn.danger {
          border-color: transparent;
          color: #94a3b8;
        }

        .nexus-zero-btn {
          margin-top: 1.5rem;
          padding: 10px 24px;
          border-radius: 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nexus-zero-btn:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        .zero-state-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #cbd5e1;
          border: 2px dashed #e2e8f0;
        }

        .nexus-zero-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          text-align: center;
        }

        .record-tag-critical {
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .record-tag-resolved {
          background: #f0fdf4;
          color: #166534;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #bbf7d0;
        }

        .admin-theme-dark .nexus-main-deck { background: #0f172a; border-color: #1e293b; }
        .admin-theme-dark .summary-card { background: #1e293b; border-color: #334155; }
        .admin-theme-dark .summary-value { color: white; }
        .admin-theme-dark .record-title { color: white; }
        .admin-theme-dark .record-message { color: #94a3b8; }
        .admin-theme-dark .telemetry-box .value { color: #cbd5e1; }
        .admin-theme-dark .nexus-record-item:hover { background: #1e293b; }
        .admin-theme-dark .nexus-header-btn { background: #1e293b; border-color: #334155; color: #94a3b8; }
        .admin-theme-dark .nexus-strip-pill.active { background: #0f172a; color: white; }
        .admin-theme-dark .nexus-control-bar { background: #111827; border-color: #1e293b; }
        .admin-theme-dark .nexus-search-wrap { background: #1e293b; }
        .admin-theme-dark .nexus-search-wrap input { color: white; }
        .admin-theme-dark .dock-btn { background: #1e293b; border-color: #334155; color: #94a3b8; }
        .admin-theme-dark .dock-btn.success { background: rgba(34,197,94,0.1); color: #4ade80; border-color: rgba(34,197,94,0.2); }
      `}</style>
    </div>
  );
};

export default AdminNotificationCenter;
