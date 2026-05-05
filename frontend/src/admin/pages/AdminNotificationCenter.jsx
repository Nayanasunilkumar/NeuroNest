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
  const [filterType, setFilterType] = useState('all'); // all, unread, critical, system
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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark all read failed:', error);
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
    if (notif.type === 'escalation') navigate('/admin/review-management');
    else if (notif.type === 'credentialing') navigate('/admin/manage-doctors');
    else if (notif.type === 'appointment_conflict') navigate('/admin/appointment-management');
  };

  return (
    <div className="admin-notif-center-wrapper">
      <div className="admin-notif-center-header">
        <div className="admin-notif-center-titlebox">
          <h1>Administrative Nexus</h1>
          <p>System-wide governance monitoring & audit center</p>
        </div>
        <div className="admin-notif-center-actions">
          <button 
            onClick={handleMarkAllAsRead}
            className="nexus-btn secondary"
          >
            <Check size={16} /> 
            <span>Mark All Read</span>
          </button>
          <button 
            onClick={fetchNotifications}
            className="nexus-btn primary"
          >
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      <div className="nexus-glass-card">
        {/* Toolbar */}
        <div className="nexus-toolbar">
          <div className="nexus-search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search through intelligence logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="nexus-filter-row">
            {['all', 'unread', 'critical', 'escalations', 'credentialing', 'appointments'].map(type => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setPage(1); }}
                className={`nexus-pill-btn ${filterType === type ? 'active' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="nexus-content-pool">
          {loading ? (
            <div className="nexus-loading-state">
              <div className="nexus-spinner" />
              <p>Synchronizing Nexus Feed...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="nexus-empty-state">
              <CheckCircle size={48} className="nexus-empty-icon" />
              <h3>System Status: Optimal</h3>
              <p>No intelligence logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="nexus-notif-list">
              {displayedNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`nexus-notif-item ${!notif.is_read ? 'unread' : ''} severity-${notif.metadata?.severity || 'info'}`}
                >
                  <div className="nexus-notif-icon-shell">
                    {getNotifIcon(notif.type, notif.metadata?.severity)}
                  </div>
                  
                  <div className="nexus-notif-body">
                    <div className="nexus-notif-header">
                      <div className="nexus-notif-title-row">
                        <h4 className="nexus-notif-title">{notif.title}</h4>
                        {!notif.is_read && <span className="nexus-unread-dot" />}
                        {notif.metadata?.severity === 'critical' && (
                          <span className="nexus-critical-tag">Critical Impact</span>
                        )}
                      </div>
                      <div className="nexus-notif-actions">
                        {!notif.is_read && (
                          <button onClick={(e) => handleMarkRead(notif.id, e)} title="Mark Read">
                            <Check size={18} />
                          </button>
                        )}
                        <button onClick={(e) => handleDelete(notif.id, e)} title="Delete" className="delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="nexus-notif-message">
                      {(notif.message || notif.content || "").replace(/Dr\. Dr\./g, 'Dr.')}
                    </p>
                    
                    <div className="nexus-notif-footer">
                      <div className="nexus-notif-meta">
                        <Clock3 size={14} />
                        <span>{formatRelativeTime(notif.created_at)}</span>
                        {notif.metadata?.category && (
                          <>
                            <span className="separator">|</span>
                            <span className="nexus-notif-cat">{notif.metadata.category}</span>
                          </>
                        )}
                      </div>
                      <button 
                        onClick={() => handleAction(notif)}
                        className="nexus-action-link"
                      >
                        Launch Governance Module <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="nexus-pagination">
            <p>
              Showing <strong>{(page - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(page * itemsPerPage, filteredNotifications.length)}</strong> of <strong>{filteredNotifications.length}</strong> entries
            </p>
            <div className="nexus-page-controls">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={20} />
              </button>
              <div className="nexus-page-numbers">
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
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-notif-center-wrapper {
          padding: 2rem;
          max-width: 1100px;
          margin: 0 auto;
          animation: nexusFadeIn 0.5s ease;
        }

        @keyframes nexusFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .admin-notif-center-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }

        .admin-notif-center-titlebox h1 {
          font-size: 2.25rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .admin-notif-center-titlebox p {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
        }

        .admin-notif-center-actions {
          display: flex;
          gap: 1rem;
        }

        .nexus-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid transparent;
        }

        .nexus-btn.primary {
          background: #2563eb;
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .nexus-btn.primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        }

        .nexus-btn.secondary {
          background: white;
          color: #475569;
          border-color: #e2e8f0;
        }

        .nexus-btn.secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }

        .nexus-glass-card {
          background: white;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .nexus-toolbar {
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          background: #fcfdfe;
        }

        .nexus-search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f1f5f9;
          padding: 0.75rem 1.25rem;
          border-radius: 16px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .nexus-search-box:focus-within {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .nexus-search-box input {
          border: 0;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .nexus-search-box input::placeholder {
          color: #94a3b8;
        }

        .nexus-filter-row {
          display: flex;
          gap: 0.5rem;
        }

        .nexus-pill-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: capitalize;
          background: #f1f5f9;
          color: #64748b;
          border: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nexus-pill-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .nexus-pill-btn.active {
          background: #0f172a;
          color: white;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
        }

        .nexus-content-pool {
          min-height: 500px;
        }

        .nexus-notif-list {
          display: flex;
          flex-direction: column;
        }

        .nexus-notif-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.75rem 2rem;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.2s ease;
          position: relative;
        }

        .nexus-notif-item:hover {
          background: #f8fafc;
        }

        .nexus-notif-item.unread {
          background: rgba(37, 99, 235, 0.02);
        }

        .nexus-notif-item.unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #2563eb;
        }

        .nexus-notif-icon-shell {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 18px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }

        .nexus-notif-body {
          flex: 1;
        }

        .nexus-notif-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .nexus-notif-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nexus-notif-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .nexus-unread-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .nexus-critical-tag {
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nexus-notif-actions {
          display: flex;
          gap: 0.5rem;
        }

        .nexus-notif-actions button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 0;
          background: transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nexus-notif-actions button:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }

        .nexus-notif-actions button.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .nexus-notif-message {
          color: #64748b;
          font-size: 1.05rem;
          line-height: 1.6;
          margin: 0 0 1.25rem 0;
          max-width: 800px;
        }

        .nexus-notif-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nexus-notif-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .nexus-notif-meta .separator {
          opacity: 0.3;
        }

        .nexus-notif-cat {
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .nexus-action-link {
          background: transparent;
          border: 0;
          color: #2563eb;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nexus-action-link:hover {
          color: #1d4ed8;
          transform: translateX(4px);
        }

        .nexus-pagination {
          padding: 1.5rem 2rem;
          background: #fcfdfe;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f1f5f9;
        }

        .nexus-pagination p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .nexus-page-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nexus-page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .nexus-page-numbers button {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nexus-page-numbers button.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
        }

        .nexus-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
          text-align: center;
        }

        .nexus-empty-icon {
          color: #e2e8f0;
          margin-bottom: 1.5rem;
        }

        .nexus-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
        }

        .nexus-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f1f5f9;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .admin-theme-dark .nexus-glass-card { background: #0f172a; border-color: #1e293b; }
        .admin-theme-dark .nexus-toolbar { background: #111827; border-color: #1e293b; }
        .admin-theme-dark .nexus-search-box { background: #1e293b; }
        .admin-theme-dark .nexus-search-box input { color: #f1f5f9; }
        .admin-theme-dark .nexus-pill-btn { background: #1e293b; color: #94a3b8; }
        .admin-theme-dark .nexus-pill-btn.active { background: white; color: #0f172a; }
        .admin-theme-dark .nexus-notif-item { border-color: #1e293b; }
        .admin-theme-dark .nexus-notif-item:hover { background: #1e293b; }
        .admin-theme-dark .nexus-notif-icon-shell { background: #1e293b; border-color: #334155; }
        .admin-theme-dark .nexus-notif-title { color: white; }
        .admin-theme-dark .nexus-notif-cat { background: #1e293b; color: #94a3b8; }
        .admin-theme-dark .nexus-pagination { background: #111827; border-color: #1e293b; }
        .admin-theme-dark .admin-notif-center-titlebox h1 { color: #f1f5f9; }
      `}</style>
    </div>
  );
};

export default AdminNotificationCenter;
