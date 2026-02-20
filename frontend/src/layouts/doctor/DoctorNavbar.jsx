import React, { useState, useEffect } from 'react';
import { BellRing, Moon, Sun, ChevronDown, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getModuleByPathname } from '../../modules/moduleRegistry';

const DoctorNavbar = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const matchedModule = getModuleByPathname(location.pathname);
  const title = matchedModule?.label || 'Dashboard';
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Nayana',
    specialization: 'Neurologist',
    avatar: 'D'
  });

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

  return (
    <div className="doctor-navbar">
        {/* Left: Title & Date */}
        <div className="doc-nav-left">
            <div className="doc-nav-title-group">
                <h1 className="page-title">{title}</h1>
                <span className="doc-nav-date">
                    <Calendar size={14} />
                    {currentDate}
                </span>
            </div>
        </div>

        {/* Center: Global Search (Optional visual enhancement) */}
        <div className="doc-nav-center hidden md:flex">
            <div className="doc-global-search">
                <input type="text" placeholder="Search patients, appointments..." className="search-input" />
                <span className="search-shortcut">⌘K</span>
            </div>
        </div>

        {/* Right: Actions */}
        <div className="doc-nav-right">
            <button 
                className="action-btn theme-toggle" 
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Switch to Light Mode" : "Dark Mode"}
            >
                {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            
            <button className="action-btn notification-btn">
                <BellRing size={20} className="text-slate-600 dark:text-slate-300" />
                <span className="notification-dot"></span>
            </button>
            
            <div className="doc-profile-trigger">
                <div className="doc-profile-info hidden sm:block">
                    <p className="doc-profile-name">{doctorInfo.name}</p>
                    <p className="doc-profile-role">{doctorInfo.specialization}</p>
                </div>
                <div className="doc-avatar-ring">
                    <div className="doc-avatar">
                        {doctorInfo.avatar}
                    </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </div>
        </div>
    </div>
  );
};

export default DoctorNavbar;
