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
    <div className={`d-flex align-items-center justify-content-between px-3 px-md-4 border-bottom shadow-sm ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ height: '80px', zIndex: 40, flexShrink: 0 }}>
      {/* Left: Hamburger (mobile) + Title */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        {/* Mobile hamburger */}
        <button
          className="btn btn-link text-decoration-none p-0 d-md-none text-secondary"
          onClick={onMobileMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="d-flex flex-column justify-content-center">
          <h1 className={`m-0 fw-bold fs-4 ${darkMode ? 'text-white' : 'text-dark'}`} style={{ letterSpacing: '-0.02em' }}>{title}</h1>
          <span className="d-none d-md-flex align-items-center gap-1 text-muted small fw-medium text-uppercase" style={{ letterSpacing: '0.05em' }}>
            <Calendar size={12} />
            {currentDate}
          </span>
        </div>
      </div>

      {/* Center: Search (hidden on small screens) */}
      <div className="d-none d-lg-flex flex-grow-1 justify-content-center px-4">
        <div className="input-group" style={{ maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Search patients, appointments..."
            className={`form-control border-end-0 shadow-none ${darkMode ? 'bg-secondary text-light border-secondary' : 'bg-light border-light'}`}
            style={{ borderRadius: '12px 0 0 12px' }}
          />
          <span className={`input-group-text bg-transparent border-start-0 ${darkMode ? 'border-secondary text-light' : 'border-light bg-light'}`} style={{ borderRadius: '0 12px 12px 0' }}>
            <span className="badge text-secondary border fw-bold" style={{ fontSize: '10px' }}>⌘K</span>
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <button
          className="btn btn-outline-secondary d-none d-md-flex align-items-center justify-content-center border-0 rounded-circle"
          style={{ width: '40px', height: '40px' }}
          onClick={toggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Dark Mode"}
        >
          {darkMode
            ? <Sun size={20} className="text-warning" />
            : <Moon size={20} className="text-secondary" />
          }
        </button>

        <div className="position-relative" ref={dropdownRef}>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center border-0 rounded-circle position-relative"
            style={{ width: '40px', height: '40px' }}
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
          >
            <BellRing size={20} className={darkMode ? 'text-light' : 'text-secondary'} />
            {hasNotifications && (
              <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: '8px', right: '4px' }}>
                <span className="visually-hidden">New alerts</span>
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className={`position-absolute top-100 end-0 mt-2 shadow bg-white rounded-4 p-2`} style={{ 
              width: '320px', 
              zIndex: 1060,
              background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}>
              <div className="d-flex align-items-center justify-content-between p-2 mb-1">
                <span className={`fw-bold small ${darkMode ? 'text-light' : 'text-dark'}`}>
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <span className="badge bg-danger rounded-pill flex-shrink-0" style={{ fontSize: '10px' }}>
                    {notifications.length} NEW
                  </span>
                )}
              </div>
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => { setShowDropdown(false); navigate(n.link); }}
                    className={`d-flex gap-3 p-2 rounded-3 cursor-pointer mb-1 transition-all ${darkMode ? 'text-light hover-bg-dark' : 'text-dark hover-bg-light'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ 
                      width: '38px', height: '38px',
                      background: n.type === 'request' ? 'rgba(13, 110, 253, 0.1)' :
                                  n.type === 'chat' ? 'rgba(25, 135, 84, 0.1)' :
                                  'rgba(255, 193, 7, 0.1)'
                    }}>
                      {n.icon}
                    </div>
                    <div className="flex-grow-1">
                       <div className="fw-bold fs-6 mb-0 lh-sm">{n.title}</div>
                       <div className={`small fw-medium ${darkMode ? 'text-secondary' : 'text-muted'}`}>{n.desc}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-4 text-center small fw-medium ${darkMode ? 'text-secondary' : 'text-muted'}`}>
                  You're all caught up!
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`d-flex align-items-center gap-2 p-1 rounded-3 px-2 transition-all ${darkMode ? 'hover-bg-dark border-secondary' : 'hover-bg-light border-light'}`} style={{ cursor: 'pointer' }}>
          <div className="d-none d-md-block text-end me-1">
            <p className={`m-0 fw-bold small lh-1 ${darkMode ? 'text-light' : 'text-dark'}`}>{doctorInfo.name}</p>
            <p className="m-0 text-muted fw-bold text-uppercase lh-1 mt-1" style={{ fontSize: '0.65rem' }}>{doctorInfo.specialization}</p>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ 
            width: '36px', height: '36px', 
            background: 'linear-gradient(135deg, #0d6efd, #6610f2)', 
            fontSize: '0.9rem' 
          }}>
            {doctorInfo.avatar}
          </div>
          <ChevronDown size={14} className="text-muted d-none d-md-block ms-1" />
        </div>
      </div>
    </div>
  );
};

export default DoctorNavbar;
