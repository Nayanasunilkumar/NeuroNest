import React, { useMemo } from 'react';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  Video, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Trash2, 
  X,
  Stethoscope,
  Heart
} from 'lucide-react';

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

const NotificationPanel = ({ 
  notifications = [], 
  onMarkAllRead, 
  onMarkRead, 
  onDelete, 
  onClose,
  darkMode = false,
  onNavigate
}) => {
  
  // Grouping logic
  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: []
    };

    notifications.forEach(notif => {
      const date = new Date(notif.created_at);
      if (isToday(date)) {
        groups.Today.push(notif);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return groups;
  }, [notifications]);

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
      case 'request':
        return <Calendar size={18} className="text-blue-500" />;
      case 'chat':
      case 'message':
        return <MessageSquare size={18} className="text-emerald-500" />;
      case 'video':
      case 'video_call':
        return <Video size={18} className="text-purple-500" />;
      case 'alert':
      case 'error':
        return <AlertTriangle size={18} className="text-rose-500" />;
      case 'vitals':
      case 'health':
        return <Heart size={18} className="text-red-500" />;
      default:
        return <Info size={18} className="text-slate-400" />;
    }
  };

  const getBgColor = (type, isRead) => {
    if (isRead) return 'transparent';
    switch (type?.toLowerCase()) {
      case 'appointment': return 'rgba(59, 130, 246, 0.05)';
      case 'chat': return 'rgba(16, 185, 129, 0.05)';
      case 'video': return 'rgba(139, 92, 246, 0.05)';
      case 'alert': return 'rgba(244, 63, 94, 0.1)';
      default: return 'rgba(71, 85, 105, 0.05)';
    }
  };

  const renderSection = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <h6 className={`px-3 py-2 mb-1 text-uppercase tracking-wider fw-bold ${darkMode ? 'text-secondary opacity-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
          {title}
        </h6>
        {items.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => {
              if (!notif.is_read && onMarkRead) onMarkRead(notif.id);
              if (notif.link && notif.link !== '#' && onNavigate) onNavigate(notif.link);
            }}
            className={`d-flex gap-3 px-3 py-3 position-relative cursor-pointer transition-all border-bottom border-opacity-10 ${darkMode ? 'hover-bg-dark border-secondary' : 'hover-bg-light border-light'}`}
            style={{ 
              background: getBgColor(notif.type, notif.is_read)
            }}
          >
            {/* Unread Indicator */}
            {!notif.is_read && (
              <div 
                 className="position-absolute bg-primary rounded-circle" 
                 style={{ width: '6px', height: '6px', left: '12px', top: '22px', boxShadow: '0 0 8px rgba(13, 110, 253, 0.6)' }}
              />
            )}

            {/* Icon Column */}
            <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} shadow-sm`} style={{ width: '40px', height: '40px' }}>
              {getIcon(notif.type)}
            </div>

            {/* Content Column */}
            <div className="flex-grow-1 min-width-0">
               <div className="d-flex align-items-start justify-content-between mb-1">
                  <p className={`mb-0 lh-sm fw-bold fs-6 ${darkMode ? 'text-white' : 'text-dark'} ${!notif.is_read ? '' : 'opacity-60'}`} style={{ fontSize: '0.9rem' }}>
                    {notif.title}
                  </p>
                  <span className={`flex-shrink-0 ms-2 ${darkMode ? 'text-slate-500' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
               </div>
               <p className={`mb-0 small line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-secondary'}`} style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                 {notif.message || notif.desc}
               </p>
            </div>

            {/* Actions */}
            <div className="notif-actions d-none d-md-flex flex-column gap-2 opacity-0 transition-all ms-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete && onDelete(notif.id); }}
                  className="btn btn-sm p-1 text-secondary hover-text-danger border-0"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`notification-panel-wrapper shadow-2xl rounded-4 overflow-hidden border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} style={{ 
      width: '380px', 
      maxHeight: '520px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1100,
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '12px'
    }}>
      {/* Header */}
      <div className={`p-3 d-flex align-items-center justify-content-between border-bottom ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="d-flex align-items-center gap-2">
           <h5 className={`mb-0 fw-black text-uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-primary'}`} style={{ fontSize: '0.85rem' }}>Notifications</h5>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onMarkAllRead && onMarkAllRead(); }}
          className="btn btn-sm p-1 text-primary fw-bold text-decoration-none transition-all hover-translate-y border-0" 
          style={{ fontSize: '0.68rem', background: 'transparent' }}
        >
          Mark all as read
        </button>
      </div>

      {/* Body */}
      <div className="flex-grow-1 overflow-y-auto custom-scrollbar p-0">
        {notifications.length > 0 ? (
          <div className="py-2">
            {renderSection('Today', groupedNotifications.Today)}
            {renderSection('Yesterday', groupedNotifications.Yesterday)}
            {renderSection('Earlier', groupedNotifications.Earlier)}
          </div>
        ) : (
          <div className="p-5 text-center d-flex flex-column align-items-center justify-content-center h-100 opacity-60">
             <div className={`p-4 rounded-circle mb-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <CheckCircle2 size={32} className="text-slate-400" />
             </div>
             <p className={`mb-0 fw-medium fs-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>You're all caught up!</p>
             <p className="small text-muted mt-1">No new alerts to review.</p>
          </div>
        )}
      </div>

      <style>{`
        .notification-panel-wrapper {
          backdrop-filter: blur(28px);
          animation: slideDownIn 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tracking-wider { letter-spacing: 0.1em; }
        .hover-bg-light:hover { background: rgba(0,0,0,0.02) !important; }
        .hover-bg-dark:hover { background: rgba(255,255,255,0.03) !important; }
        .hover-translate-y:hover { transform: translateY(-1px); }
        .hover-text-danger:hover { color: #ef4444 !important; }
        
        .notification-panel-wrapper div[key]:hover .notif-actions {
          opacity: 1;
        }

        @keyframes slideDownIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0,0,0,0.08); 
          border-radius: 10px; 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.08); 
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
