import React, { useState, useEffect, useRef } from 'react';
import { BellRing, Moon, Sun, ChevronDown, Calendar, MessageSquare, CalendarCheck, Star, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../../doctor/services/doctorProfileService';
import { getAppointmentRequests } from '../../shared/services/api/doctor';
import { getConversations } from '../../shared/services/api/chat';
import { doctorFeedbackService } from '../../shared/services/api/doctorFeedbackService';
import { getUser } from '../../shared/utils/auth';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../shared/services/api/profileApi';
import DynamicIslandNav from '../../shared/components/DynamicIslandNav';
import NotificationPanel from '../../shared/components/notifications/NotificationPanel';
import { Bell, Info, AlertTriangle } from 'lucide-react';
import { useAlerts } from '../../shared/context/AlertContext';
import { useSystemConfig } from '../../shared/context/SystemConfigContext';

const DoctorNavbar = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const { platformName } = useSystemConfig();
  const { alerts, unreadCount, markAcknowledged } = useAlerts() || { alerts: [], unreadCount: 0, markAcknowledged: () => {} };
  const currentUser = getUser();
  const fallbackName = currentUser?.full_name || 'Doctor';
  const fallbackAvatar = fallbackName.charAt(0).toUpperCase() || 'D';
  const [doctorInfo, setDoctorInfo] = useState({
    name: fallbackName,
    specialization: 'Specialist',
    avatar: fallbackAvatar
  });

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getDoctorProfile();
        setDoctorInfo({
          name: data?.full_name || fallbackName,
          specialization: data?.specialization || 'Specialist',
          avatar: (data?.full_name || fallbackName).charAt(0).toUpperCase() || fallbackAvatar
        });
      } catch (err) {
        console.error("Failed to fetch doctor info for navbar", err);
      }
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = [];
        // Sources: Appointment Requests, Chats, Feedback, and General Notifications
        const [reqs, convs, user] = await Promise.all([
          getAppointmentRequests().catch(() => []),
          getConversations().catch(() => []),
          getUser()
        ]);

        const pending = reqs.filter(r => r.status?.toLowerCase() === 'pending').length;
        if (pending > 0) {
          notifs.push({
            id: 'appts',
            type: 'request',
            title: `${pending} New Appointment Request${pending > 1 ? 's' : ''}`,
            desc: 'Requires your approval',
            link: '/doctor/appointment-requests',
            icon: <CalendarCheck size={16} className="text-blue-500" />,
            created_at: new Date().toISOString(), // Fallback
            is_read: false
          });
        }

        const unreadConvs = convs.filter(c => c.unread_count > 0);
        if (unreadConvs.length > 0) {
           const totalUnread = unreadConvs.reduce((acc, c) => acc + c.unread_count, 0);
           notifs.push({
             id: 'chat',
             type: 'chat',
             title: `${totalUnread} Unread Message${totalUnread > 1 ? 's' : ''}`,
             desc: `From ${unreadConvs.length} patient${unreadConvs.length > 1 ? 's' : ''}`,
             link: '/doctor/chat',
             icon: <MessageSquare size={16} className="text-emerald-500" />,
             created_at: new Date().toISOString(),
             is_read: false
           });
        }

        if (user?.id) {
          try {
            const summary = await doctorFeedbackService.getSummary(user.id);
            if (summary && summary.negative_reviews_30d > 0) {
               notifs.push({
                 id: 'feedback',
                 type: 'feedback',
                 title: `Review Alert`,
                 desc: `${summary.negative_reviews_30d} recent negative review(s)`,
                 link: '/doctor/feedback-reviews',
                 icon: <Star size={16} className="text-amber-500" />,
                 created_at: new Date().toISOString(),
                 is_read: false
               });
            }
          } catch {}
        }

        const generalNotifs = await getMyNotifications(false); // Fetch all for grouping
        generalNotifs.forEach(n => {
          notifs.push({
            id: `gen-${n.id}`,
            type: n.type || 'general',
            title: n.title,
            message: n.message,
            link: '#',
            created_at: n.created_at,
            is_read: n.is_read,
            backend_id: n.id
          });
        });

        // Deduplication and sorting
        const uniqueNotifs = Array.from(new Map(notifs.map(item => [item.title + item.desc, item])).values());
        setNotifications(uniqueNotifs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      if (id.startsWith('gen-')) {
        const backendId = id.split('-')[1];
        await markNotificationRead(backendId);
      }
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (id.startsWith('gen-')) {
        const backendId = id.split('-')[1];
        await deleteNotification(backendId);
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  useEffect(() => {
    if (showDropdown && notifications.some(n => !n.is_read)) {
      handleMarkAllRead();
    }
  }, [showDropdown]);

  const hasNotifications = notifications.length > 0 || unreadCount > 0;
  const totalNotifications = notifications.length + unreadCount;
  const unacknowledgedAlerts = alerts?.filter(a => !a.is_acknowledged) || [];

  return (
    <div className={`doctor-navbar-root d-flex align-items-center justify-content-between px-3 px-md-4 border-bottom shadow-sm ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ height: '80px', zIndex: 1060, flexShrink: 0, flexWrap: 'nowrap' }}>
      {/* Left: Branding */}
      <div className="d-flex align-items-center flex-shrink-0 me-3 me-xl-5">
          <span className={`h4 fw-black mb-0 ${darkMode ? 'text-white' : 'text-primary'}`} style={{ letterSpacing: '-0.05em' }}>
            {(platformName || 'NeuroNest').toUpperCase()}
          </span>
      </div>

      {/* Center: Dynamic Island Navigation */}
      <div className="d-none d-lg-flex overflow-hidden" style={{ minWidth: 0, flexShrink: 1 }}>
          <DynamicIslandNav role="doctor" />
      </div>

      {/* Spacer */}
      <div className="flex-grow-1 d-none d-lg-block"></div>

      {/* Right Actions */}
      <div className="d-flex align-items-center justify-content-end gap-3 gap-md-4 flex-shrink-0 ms-3">
        <button
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center border-0 rounded-circle shadow-sm transition-all"
          style={{ width: '36px', height: '36px' }}
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={18} className="text-warning" /> : <Moon size={18} className="text-secondary" />}
        </button>

        <div className="position-relative" ref={dropdownRef}>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center border-0 rounded-circle position-relative shadow-sm transition-all"
            style={{ width: '36px', height: '36px' }}
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
          >
            <BellRing size={18} className={darkMode ? 'text-light' : 'text-secondary'} />
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: '8px', right: '4px' }}></span>
            )}
          </button>
          
          {showDropdown && (
            <NotificationPanel 
              notifications={notifications}
              unreadCount={unreadCount}
              darkMode={darkMode}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              onClose={() => setShowDropdown(false)}
              onNavigate={(link) => {
                setShowDropdown(false);
                navigate(link);
              }}
            />
          )}
        </div>

        <div className={`vr mx-1 ${darkMode ? 'text-light opacity-25' : 'text-secondary opacity-25'}`} style={{ width: '1px', height: '24px' }}></div>

        <div className={`d-flex align-items-center gap-2 p-1 rounded-pill ps-2 pe-1 transition-all border ${darkMode ? 'hover-bg-dark border-secondary bg-dark bg-opacity-50' : 'hover-bg-light border-light bg-light bg-opacity-50'}`} style={{ cursor: 'pointer' }} onClick={() => navigate('/doctor/profile')}>
          <div className="d-none d-xl-block text-end me-1">
            <p className={`m-0 fw-bold small lh-1 ${darkMode ? 'text-light' : 'text-dark'}`}>{doctorInfo.name}</p>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ 
            width: '34px', height: '34px', 
            background: 'linear-gradient(135deg, #0d6efd, #6610f2)', 
            fontSize: '0.85rem' 
          }}>{doctorInfo.avatar}</div>
        </div>

        <button 
          className="btn btn-danger-soft rounded-circle p-2 border-0 shadow-sm flex-shrink-0 transition-all"
          onClick={() => {
            import('../../shared/utils/auth').then(m => m.logout());
          }}
          title="Logout"
          style={{ width: '36px', height: '36px' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default DoctorNavbar;
