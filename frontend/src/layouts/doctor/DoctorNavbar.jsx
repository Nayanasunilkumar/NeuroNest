import React, { useState, useEffect, useRef } from 'react';
import { BellRing, Moon, Sun, ChevronDown, Calendar, MessageSquare, CalendarCheck, Star, Activity, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getModuleByPathname } from '../../modules/moduleRegistry';
import { getAppointmentRequests } from '../../api/doctor';
import { getConversations } from '../../api/chat';
import { doctorFeedbackService } from '../../services/doctorFeedbackService';
import { getUser } from '../../utils/auth';
import DynamicIslandNav from '../../components/DynamicIslandNav';

const DoctorNavbar = ({ darkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Nayana',
    specialization: 'Neurologist',
    avatar: 'D'
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

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = [];
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
    <div className={`d-flex align-items-center justify-content-between px-3 px-md-4 border-bottom shadow-sm ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ height: '80px', zIndex: 1060, flexShrink: 0, flexWrap: 'nowrap' }}>
      {/* Left: Branding */}
      <div className="d-flex align-items-center flex-shrink-0 me-3 me-xl-5">
          <span className={`h4 fw-black mb-0 ${darkMode ? 'text-white' : 'text-primary'}`} style={{ letterSpacing: '-0.05em' }}>NEURONEST</span>
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
            {hasNotifications && (
              <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: '8px', right: '4px' }}></span>
            )}
          </button>
          
          {showDropdown && (
            <div className={`position-absolute top-100 end-0 mt-2 shadow-lg rounded-4 p-2`} style={{ 
              width: '320px', 
              zIndex: 1060,
              background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}>
              <div className="d-flex align-items-center justify-content-between p-2 mb-1 border-bottom border-opacity-10 pb-2">
                <span className={`fw-bold small ${darkMode ? 'text-light' : 'text-dark'}`}>Notifications</span>
                {notifications.length > 0 && <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.6rem' }}>{notifications.length} NEW</span>}
              </div>
              <div className="p-1 max-vh-50 overflow-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} onClick={() => { setShowDropdown(false); navigate(n.link); }} className={`d-flex gap-3 p-2 rounded-3 cursor-pointer mb-1 transition-all ${darkMode ? 'text-light hover-bg-dark' : 'text-dark hover-bg-light'}`}>
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ 
                        width: '38px', height: '38px',
                        background: n.type === 'request' ? 'rgba(13, 110, 253, 0.1)' : n.type === 'chat' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(255, 193, 7, 0.1)'
                      }}>{n.icon}</div>
                      <div className="flex-grow-1">
                         <div className="fw-bold fs-6 mb-0 lh-sm">{n.title}</div>
                         <div className={`small fw-medium ${darkMode ? 'text-secondary' : 'text-muted'}`}>{n.desc}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-4 text-center small fw-medium ${darkMode ? 'text-secondary' : 'text-muted'}`}>You're all caught up!</div>
                )}
              </div>
            </div>
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
            import('../../utils/auth').then(m => m.logout());
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
