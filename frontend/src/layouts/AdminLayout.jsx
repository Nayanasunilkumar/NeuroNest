import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DynamicIslandNav from '../components/DynamicIslandNav';
import { logout } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import { useSystemConfig } from '../context/SystemConfigContext';
import '../styles/admin-theme.css';
import { 
    LogOut, Sun, Moon, Bell, Search, User
} from 'lucide-react';

const AdminLayout = () => {
  const { isDark: darkMode, toggleTheme } = useTheme();
  const { platformName } = useSystemConfig();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className={`admin-theme ${darkMode ? 'admin-theme-dark' : 'admin-theme-light'} min-h-screen flex flex-col overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Premium Admin Header */}
      <header 
        className={`sticky top-0 z-[1050] h-20 px-6 flex items-center justify-between backdrop-blur-md border-b transition-all duration-300 ${
            darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-8 w-full">
            {/* Left: Branding */}
            <div className="flex items-center flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/20">
                    <span className="font-black text-xl">N</span>
                </div>
                <span className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                    {(platformName || 'NEURONEST').toUpperCase()}
                </span>
            </div>

            {/* Center: Dynamic Island Navigation (Always Visible but handled by component) */}
            <div className="hidden lg:flex flex-1 justify-center max-w-2xl mx-auto">
                <DynamicIslandNav role="admin" />
            </div>

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0">
                 
                 {/* Search & Alerts - Hidden on mobile */}
                 <div className="hidden md:flex items-center gap-2 mr-2">
                    <button className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <Search size={20} />
                    </button>
                    <button className={`p-2 rounded-xl transition-colors relative ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                    </button>
                 </div>

                 {/* System Clock - Desktop only */}
                 <div className="hidden xl:flex flex-col align-items-end px-4 border-r border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-black font-mono leading-none mb-1">
                        {currentTime.toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                        {currentTime.toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                 </div>

                 {/* Theme Toggle */}
                 <button 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    onClick={toggleTheme}
                 >
                    {darkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
                 </button>

                 {/* Profile/Logout */}
                 <div className="flex items-center gap-2">
                    <button 
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:scale-105 transition-transform"
                        title="Profile"
                    >
                        <User size={20} />
                    </button>
                    <button 
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                        onClick={logout}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                 </div>
            </div>
        </div>
      </header>

      {/* Mobile Nav Pills (Shows on bottom for mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
         <DynamicIslandNav role="admin" />
      </div>

      {/* Main Execution Flow */}
      <main className="flex-1 overflow-y-auto scroll-smooth px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <div className="admin-page-shell min-h-full">
          <Outlet />
        </div>
      </main>

      <style>{`
        .scroll-smooth { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
