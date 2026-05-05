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
      const response = await notificationApi.getAdminNotifications();
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
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Mark read failed:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark all read failed:', error);
    }
  };

  const getNotifIcon = (type, severity) => {
    if (severity === 'critical' || type === 'escalation') return <ShieldAlert size={20} className="text-rose-500" />;
    if (type === 'credentialing') return <ShieldCheck size={20} className="text-blue-500" />;
    if (type === 'system') return <Activity size={20} className="text-amber-500" />;
    if (type === 'appointment_conflict') return <AlertTriangle size={20} className="text-orange-500" />;
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
      const matchesSearch = (n.title + n.message).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || 
                         (filterType === 'unread' && !n.is_read) ||
                         (filterType === 'critical' && n.metadata?.severity === 'critical') ||
                         (filterType === 'system' && n.type === 'system');
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
    <div className="admin-notif-center p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Administrative Nexus</h1>
          <p className="text-slate-500 dark:text-slate-400">System-wide governance monitoring & audit center</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Check size={16} /> Mark All Read
          </button>
          <button 
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Refresh Feed
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl w-full md:w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notifications..."
              className="bg-transparent border-0 outline-none text-sm w-full text-slate-700 dark:text-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'unread', 'critical', 'system'].map(type => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  filterType === type 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                    : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600 mb-4" />
              <p className="text-slate-400 font-medium">Synchronizing Secure Nexus Feed...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-slate-200 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">System Status: Optimal</h3>
              <p className="text-slate-500 max-w-sm">No notifications found matching your current filter criteria. You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-6 flex gap-5 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${!notif.is_read ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    notif.metadata?.severity === 'critical' 
                      ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30' 
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
                  }`}>
                    {getNotifIcon(notif.type, notif.metadata?.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-lg font-bold leading-tight ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </h4>
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                        {notif.metadata?.severity === 'critical' && (
                          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Critical Impact</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => handleMarkRead(notif.id, e)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Mark Read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDelete(notif.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-4 max-w-3xl leading-relaxed ${notif.is_read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {(notif.message || notif.content || "").replace(/Dr\. Dr\./g, 'Dr.')}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Clock3 size={14} />
                        {formatRelativeTime(notif.created_at)}
                      </div>
                      {notif.metadata?.category && (
                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                          {notif.metadata.category}
                        </div>
                      )}
                      <button 
                        onClick={() => handleAction(notif)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group no-underline"
                      >
                        Launch Governance Module <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(page * itemsPerPage, filteredNotifications.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredNotifications.length}</span> entries
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      page === i + 1 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-notif-center {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminNotificationCenter;
