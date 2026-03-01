import React, { useState, useEffect, useRef } from 'react';
import { BellRing, Moon, Sun, ChevronDown, Calendar, Menu, MessageSquare, CalendarCheck, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getModuleByPathname } from '../../modules/moduleRegistry';
import { getAppointmentRequests } from '../../api/doctor';
import { getConversations } from '../../api/chat';
import { doctorFeedbackService } from '../../services/doctorFeedbackService';
import { getUser } from '../../utils/auth';

const DoctorNavbar = ({ darkMode, toggleTheme, onMobileMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const matchedModule = getModuleByPathname(location.pathname);
  const title = matchedModule?.label || 'Dashboard';
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Nayana',
    specialization: 'Neurologist',
    avatar: 'D'
  });

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
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
        if (data && data.full_name) {
          setDoctorInfo({
            name: data.full_name,
            specialization: data.specialization || 'Specialist',
            avatar: data.full_name.charAt(0).toUpperCase()
          });
        }
      } catch (err) {
        console.error("Failed to fetch doctor info for navbar", err);
      }
    };
    fetchInfo();
  }, []);

  // Fetch active notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = [];
        
        // 1. Appt Requests
        try {
          const reqs = await getAppointmentRequests();
          const pending = reqs.filter(r => r.status?.toLowerCase() === 'pending').length;
          if (pending > 0) {
            notifs.push({
              id: 'appts',
              type: 'request',
              title: `${pending} New Appointment Request${pending > 1 ? 's' : ''}`,
              desc: 'Requires your approval',
              link: '/doctor/requests',
              icon: <CalendarCheck size={16} className="text-blue-500" />
            });
          }
        } catch(e) {}

        // 2. Chat Messages
        try {
          const convs = await getConversations();
          const unreadConvs = convs.filter(c => c.unread_count > 0);
          if (unreadConvs.length > 0) {
             const totalUnread = unreadConvs.reduce((acc, c) => acc + c.unread_count, 0);
             notifs.push({
               id: 'chat',
               type: 'chat',
               title: `${totalUnread} Unread Message${totalUnread > 1 ? 's' : ''}`,
               desc: `From ${unreadConvs.length} patient${unreadConvs.length > 1 ? 's' : ''}`,
               link: '/doctor/chat',
               icon: <MessageSquare size={16} className="text-emerald-500" />
             });
          }
        } catch(e) {}

        // 3. Feedback/Reviews
        try {
          const user = getUser();
          if (user?.id) {
            const summary = await doctorFeedbackService.getSummary(user.id);
            if (summary && summary.negative_reviews_30d > 0) {
               notifs.push({
                 id: 'feedback',
                 type: 'feedback',
                 title: `Review Alert`,
                 desc: `${summary.negative_reviews_30d} recent negative review(s)`,
                 link: '/doctor/feedback-reviews',
                 icon: <Star size={16} className="text-amber-500" />
               });
            }
          }
        } catch(e) {}

        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <div className="doctor-navbar">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="doc-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile hamburger */}
        <button
          className="doc-mobile-menu-btn"
          onClick={onMobileMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="doc-nav-title-group">
          <h1 className="page-title">{title}</h1>
          <span className="doc-nav-date hide-on-mobile">
            <Calendar size={14} />
            {currentDate}
          </span>
        </div>
      </div>

      {/* Center: Search (hidden on small screens) */}
      <div className="doc-nav-center hidden md:flex">
        <div className="doc-global-search">
          <input
            type="text"
            placeholder="Search patients, appointments..."
            className="search-input"
          />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="doc-nav-right">
        <button
          className="action-btn theme-toggle hide-on-mobile"
          onClick={toggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Dark Mode"}
        >
          {darkMode
            ? <Sun size={20} className="text-yellow-400" />
            : <Moon size={20} className="text-slate-600" />
          }
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            className="action-btn notification-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
          >
            <BellRing size={20} className="text-slate-600 dark:text-slate-300" />
            {hasNotifications && <span className="notification-dot" style={{ background: '#ef4444' }}></span>}
          </button>
          
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: '-8px',
              width: '320px',
              background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: darkMode 
                  ? '0 0 0 1px rgba(0,0,0,0.5), 0 10px 40px rgba(0, 0, 0, 0.5)' 
                  : '0 0 0 1px rgba(0,0,0,0.02), 0 10px 40px rgba(0, 0, 0, 0.08)',
              borderRadius: '20px',
              padding: '6px',
              zIndex: 50,
              transformOrigin: 'top right',
              animation: 'dropdownScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <style>{`
                @keyframes dropdownScale {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
              `}</style>
              <div style={{ 
                padding: '12px 12px 8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '4px' 
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: darkMode ? '#f8fafc' : '#0f172a', letterSpacing: '-0.02em' }}>
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    color: '#fff', 
                    background: '#ef4444', 
                    padding: '2px 8px', 
                    borderRadius: '99px' 
                  }}>
                    {notifications.length} NEW
                  </span>
                )}
              </div>
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => { setShowDropdown(false); navigate(n.link); }}
                    style={{
                      padding: '12px',
                      display: 'flex',
                      gap: '14px',
                      cursor: 'pointer',
                      borderRadius: '14px',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc';
                      e.currentTarget.style.transform = 'scale(1.01)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ 
                      flexShrink: 0,
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '10px', 
                      background: n.type === 'request' ? 'rgba(59, 130, 246, 0.1)' : 
                                  n.type === 'chat' ? 'rgba(16, 185, 129, 0.1)' : 
                                  'rgba(245, 158, 11, 0.1)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1, marginTop: '1px' }}>
                       <div style={{ fontSize: '0.85rem', fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a', marginBottom: '1px', letterSpacing: '-0.01em' }}>{n.title}</div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 500, color: darkMode ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>{n.desc}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '30px 16px', textAlign: 'center', fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                  You're all caught up!
                </div>
              )}
            </div>
          )}
        </div>

        <div className="doc-profile-trigger">
          <div className="doc-profile-info" style={{ display: 'none' }}>
            {/* Hidden on mobile via CSS */}
          </div>
          <div className="doc-profile-info hide-on-mobile">
            <p className="doc-profile-name">{doctorInfo.name}</p>
            <p className="doc-profile-role">{doctorInfo.specialization}</p>
          </div>
          <div className="doc-avatar-ring">
            <div className="doc-avatar">{doctorInfo.avatar}</div>
          </div>
          <ChevronDown size={14} className="text-slate-400 hide-on-mobile" />
        </div>
      </div>
    </div>
  );
};

export default DoctorNavbar;
